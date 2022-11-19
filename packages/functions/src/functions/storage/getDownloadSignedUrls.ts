import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { database } from 'firebase-admin';
import { https } from 'firebase-functions';
import {  z } from 'zod';

import { postConverter } from '../../converters/postConverter';
import { db, rtdb, s3 } from '../../instances';
import { AccessTokenManager } from '../../middleware/accessTokenManager';
import { checkSubscription } from '../../middleware/checkSubscription';

type AccessTokenPayload = {
  planId: string;
  uid: string;
};

const accessTokenManager = new AccessTokenManager<AccessTokenPayload>(
  rtdb.ref('/refreshToken'),
  'SECRET_KEY'
);

const requestDataSchama = z.object({
  accessToken: z.string().optional(),
  creatorContractAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/g),
  postId: z.string(),
});

const verify = async (
  creatorContractAddress: string,
  planId: string,
  uid: string,
  accessToken?: string
): Promise<{
  ok: boolean;
  usedAccessToken: boolean;
  tokens?: { accessToken: string; refreshToken: string };
  reason:
    | 'Invalid access token'
    | 'Subscription without access rights'
    | 'Invalid contract value'
    | 'Unknown'
    | '';
}> => {
  const payload = { planId, uid };

  if (accessToken) {
    try {
      const accessTokenPayload = await accessTokenManager.verifyAccessToken(
        accessToken
      );

      if (
        accessTokenPayload.planId !== payload.planId ||
        accessTokenPayload.uid !== payload.uid
      ) {
        throw 0;
      }

      return { ok: true, reason: '', usedAccessToken: true };
    } catch (e) {
      return {
        ok: false,
        reason: 'Invalid access token',
        usedAccessToken: true,
      };
    }
  }

  try {
    const [ok, { subscription }] = await checkSubscription(
      uid,
      creatorContractAddress,
      planId
    );

    if (!ok) {
      return {
        ok: false,
        reason: 'Subscription without access rights',
        usedAccessToken: false,
      };
    }

    payload.planId = subscription.planId.toString();

    if (subscription.balance.isNegative() || subscription.usage.isNegative()) {
      return {
        ok: false,
        reason: 'Invalid contract value',
        usedAccessToken: false,
      };
    }

    const remainingSeconds = subscription.balance
      .mul(86400)
      .div(subscription.usage);

    const accessTokenExpiresIn = remainingSeconds.lte(30 * 60)
      ? remainingSeconds.toNumber()
      : undefined;
    const refreshTokenExpiresIn = remainingSeconds.lte(60 * 60 * 24 * 7)
      ? remainingSeconds.toNumber()
      : undefined;

    const tokens = await accessTokenManager.generateNewAccessToken(
      `/${uid}/${creatorContractAddress}`,
      payload,
      accessTokenExpiresIn,
      refreshTokenExpiresIn
    );

    return { ok: true, reason: '', tokens, usedAccessToken: false };
  } catch (e) {
    return { ok: false, reason: 'Unknown', usedAccessToken: false };
  }
};

const fetchUrlsFromCache = async (
  cacheRef: database.Reference
): Promise<{
  urls: string[];
  planId: string;
  expiry: number;
  contentsType: string;
} | null> => {
  const cacheSnapshot = await cacheRef.get();
  if (!cacheSnapshot.exists()) {
    return null;
  }

  const cacheData = cacheSnapshot.val();
  if (
    !cacheData ||
    !cacheData.planId ||
    !cacheData.expiry ||
    cacheData.expiry > Date.now()
  ) {
    return null;
  }

  return cacheData;
};

const setUrlsToCache = async (
  cacheRef: database.Reference,
  urls: string[],
  planId: string,
  contentsType: string
) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const setVal = { contentsType, expiry: tomorrow, planId, urls };
  await cacheRef.set(setVal);
};

export const getDownloadSignedUrls = https.onCall(async (d, context) => {
  if (!context.auth) {
    throw new https.HttpsError('unauthenticated', 'Need auth');
  }

  const uid = context.auth.uid;

  const input = await requestDataSchama.parseAsync(d).catch(() => {
    throw new https.HttpsError('invalid-argument', 'Invalid input input');
  });

  const verifyWithHttpsError = async (planId: string) => {
    const result = await verify(
      input.creatorContractAddress,
      planId,
      uid,
      input.accessToken
    );

    const { ok, reason } = result;

    if (!ok) {
      if (
        reason === 'Invalid access token' ||
        reason === 'Subscription without access rights'
      ) {
        throw new https.HttpsError(
          'permission-denied',
          'Access to contents denied'
        );
      }
      throw new https.HttpsError('internal', reason);
    }

    return result;
  };

  const storageKeysParent = `/${input.creatorContractAddress}/${input.postId}`;
  const cacheRef = rtdb.ref(storageKeysParent);

  const cached = await fetchUrlsFromCache(cacheRef);
  if (cached) {
    const { tokens } = await verifyWithHttpsError(cached.planId);
    return { contentsType: cached.contentsType, tokens, urls: cached.urls };
  }

  const postRef = db
    .doc(`/creators/${input.creatorContractAddress}/posts/${input.postId}`)
    .withConverter(postConverter);

  const postSnapshot = await postRef.get();
  const postData = postSnapshot.data();

  if (!postData) {
    throw new https.HttpsError('not-found', 'Post not found');
  }

  const { tokens } = await verifyWithHttpsError(postData.planId);

  const urls = await Promise.all(
    [...new Array(postData.contentsCount)].map((_, i) => {
      const Key = `${storageKeysParent}/${i}}`;
      return getSignedUrl(
        s3,
        new GetObjectCommand({
          Bucket: process.env.CREATOR_LIMITED_PUBLICATION_BUCKET_NAME,
          Key,
        }),
        { expiresIn: 86400 }
      );
    })
  ).catch(() => {
    throw new https.HttpsError('internal', 'Failed to get content url');
  });

  await setUrlsToCache(
    cacheRef,
    urls,
    postData.planId,
    postData.contentsType
  ).catch(() => {
    console.error('Failed to set urls to cache');
  });

  return {
    contentsType: postData.contentsType,
    tokens: tokens || null,
    urls,
  };
});
