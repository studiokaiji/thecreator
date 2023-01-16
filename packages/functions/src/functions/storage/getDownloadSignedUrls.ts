import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { database } from 'firebase-admin';
import { https } from 'firebase-functions';
import { z } from 'zod';

import { db, rtdb, s3 } from '../../instances';
import { checkSubscription } from '../../middleware/checkSubscription';

const requestDataSchama = z.object({
  creatorId: z.string(),
  postId: z.string(),
});

const verify = async (
  holderLockAddress: string,
  borderLockAddress: string,
  uid: string
): Promise<{
  ok: boolean;
  reason:
    | 'Subscription without access rights'
    | 'Invalid contract value'
    | 'Unknown'
    | '';
}> => {
  try {
    const ok = await checkSubscription(
      uid,
      holderLockAddress,
      borderLockAddress
    );

    if (ok) {
      return { ok: true, reason: '' };
    }

    return {
      ok: false,
      reason: 'Subscription without access rights',
    };
  } catch (e) {
    return { ok: false, reason: 'Unknown' };
  }
};

const fetchUrlsFromCache = async (
  cacheRef: database.Reference
): Promise<{
  urls: string[];
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
    !cacheData.expiry ||
    cacheData.expiry > Date.now() + 5 * 60 * 1000
  ) {
    return null;
  }

  return cacheData;
};

const setUrlsToCache = async (
  cacheRef: database.Reference,
  urls: string[],
  borderLockAddress: string,
  contentsType: string,
  expiry: Date
) => {
  const setVal = { contentsType, expiry, borderLockAddress, urls };
  await cacheRef.set(setVal);
  return setVal;
};

export const getDownloadSignedUrls = https.onCall(async (d, context) => {
  if (!context.auth) {
    throw new https.HttpsError('unauthenticated', 'Need auth');
  }

  const uid = context.auth.uid;

  const reqBody = await requestDataSchama.parseAsync(d).catch(() => {
    throw new https.HttpsError('invalid-argument', 'Invalid input input');
  });

  const supportingCreatorDocRef = db
    .collection('users')
    .doc(uid)
    .collection('supporting')
    .doc(reqBody.creatorId);

  const supportingCreatorDocSnapshot = await supportingCreatorDocRef.get();
  const supportingCreatorDocData = supportingCreatorDocSnapshot.data();
  if (!supportingCreatorDocSnapshot.exists || !supportingCreatorDocData) {
    throw new https.HttpsError(
      'not-found',
      'You are trying to access content from a creator you do not support'
    );
  }

  const holderLockAddress = supportingCreatorDocData.plan.lockAddress;
  if (typeof holderLockAddress !== 'string') {
    throw new https.HttpsError(
      'not-found',
      "The plan's PublicLock address is not found"
    );
  }

  const postsCollectionRef = db
    .collection('creator')
    .doc(reqBody.creatorId)
    .collection('posts');

  const postDocRef = postsCollectionRef.doc(reqBody.postId);

  const docSnapshot = await postDocRef.get();
  const postData = docSnapshot.data() as CreatorPostDocData;

  if (!docSnapshot.exists || !postData) {
    throw new https.HttpsError(
      'not-found',
      'A nonexistent postId is specified'
    );
  }

  const { ok, reason } = await verify(
    holderLockAddress,
    postData.borderLockAddress,
    uid
  );
  if (!ok) {
    if (reason === 'Subscription without access rights') {
      throw new https.HttpsError(
        'permission-denied',
        'Access to contents denied'
      );
    }
    throw new https.HttpsError('internal', reason);
  }

  const storageKeyPath = `/postContentCaches/${reqBody.creatorId}/${reqBody.postId}`;
  const cacheRef = rtdb.ref(storageKeyPath);

  const cached = await fetchUrlsFromCache(cacheRef);
  if (cached) {
    return cached;
  }

  const urls = await Promise.all(
    [...new Array(postData.contentsCount)].map((_, j) => {
      const Key = `${storageKeyPath}/${j}}`;
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

  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 1);

  await setUrlsToCache(
    cacheRef,
    urls,
    postData.borderLockAddress,
    postData.contentsType,
    expiry
  ).catch(() => {
    console.error('Failed to set urls to cache');
  });

  return {
    urls,
    borderLockAddress: postData.borderLockAddress,
    contentsType: postData.contentsType,
    expiry,
  };
});
