import { CREATOR_LIMITED_PUBLICATION_BUCKET_NAME } from '@/constants';
import { getUserId } from '@/middleware/getUserId';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { database } from 'firebase-admin';
import { https } from 'firebase-functions';
import { z } from 'zod';

import { db, rtdb, s3 } from '../../instances';
import { checkSubscription } from '../../middleware/checkSubscription';

const requestDataSchama = z.object({
  posts: z
    .object({
      creatorId: z.string(),
      postId: z.string(),
    })
    .array(),
});

const verify = async (
  holderLockAddress: string,
  borderLockAddress: string,
  userId: string
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
      userId,
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
    console.log(e);
    return { ok: false, reason: 'Unknown' };
  }
};

const fetchUrlsFromCache = async (
  cacheRef: database.Reference
): Promise<{
  urls: string[];
  expiry: Date;
  contentsType: CreatorPostDocDataContentsType;
} | null> => {
  const cacheSnapshot = await cacheRef.get();
  if (!cacheSnapshot.exists()) {
    return null;
  }

  const cacheData = cacheSnapshot.val();
  if (
    !cacheData ||
    !cacheData.expiry ||
    (cacheData.expiry as Date).getTime() > Date.now() + 5 * 60 * 1000
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

export const getDownloadSignedUrls = https.onCall(
  async (d, context): Promise<GetDownloadSignedUrlResponse> => {
    const userId = getUserId(context);

    if (!userId) {
      throw new https.HttpsError('unauthenticated', 'Need auth');
    }

    const reqBody = await requestDataSchama.parseAsync(d).catch(() => {
      throw new https.HttpsError('invalid-argument', 'Invalid input input');
    });

    const promises = reqBody.posts.map(async ({ creatorId, postId }) => {
      const supportingCreatorColRef = db
        .collection('users')
        .doc(userId)
        .collection('supportingCreatorPlans');

      const supportingCreatorDocsSnapshot = await supportingCreatorColRef
        .where('creatorId', '==', creatorId)
        .get();

      if (
        supportingCreatorDocsSnapshot.empty ||
        !supportingCreatorDocsSnapshot.docs[0].exists
      ) {
        throw new https.HttpsError(
          'not-found',
          'You are trying to access content from a creator you do not support'
        );
      }

      const supportingCreatorDocData =
        supportingCreatorDocsSnapshot.docs[0].data();

      const holderLockAddress = supportingCreatorDocData.lockAddress;
      if (typeof holderLockAddress !== 'string') {
        throw new https.HttpsError(
          'not-found',
          "The plan's PublicLock address is not found"
        );
      }

      const postsCollectionRef = db
        .collection('creators')
        .doc(creatorId)
        .collection('posts');

      const postDocRef = postsCollectionRef.doc(postId);

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
        userId
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

      const storageKeyPath = `/postContentCaches/${creatorId}/${postId}`;
      const cacheRef = rtdb.ref(storageKeyPath);

      const cached = await fetchUrlsFromCache(cacheRef);
      if (cached) {
        return {
          ...cached,
          borderLockAddress: postData.borderLockAddress,
          postId,
          creatorId,
        };
      }

      const urls = await Promise.all(
        postData.contents.map(({ key }) => {
          return getSignedUrl(
            s3,
            new GetObjectCommand({
              Bucket: CREATOR_LIMITED_PUBLICATION_BUCKET_NAME,
              Key: key,
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
        postId,
        creatorId,
      };
    });

    const returnData = await Promise.all(promises);

    return returnData;
  }
);
