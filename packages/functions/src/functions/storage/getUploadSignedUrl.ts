import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { Conditions } from '@aws-sdk/s3-presigned-post/dist-types/types';
import { https } from 'firebase-functions';
import { z } from 'zod';

import { db, s3 } from '@/instances';
import { maxContentSizes } from '@/settings';

const Expires = 180;

const postDataContentTypes = [
  'images',
  'audio',
  'text',
  'attachedImage',
] as const;

const requestPostDataSchema = z.object({
  contentType: z.union([
    z.literal(postDataContentTypes[0]),
    z.literal(postDataContentTypes[1]),
    z.literal(postDataContentTypes[2]),
    z.literal(postDataContentTypes[3]),
  ]),
  creatorId: z.string(),
  isPublic: z.boolean().optional(),
  numOfImages: z.number().min(1).max(30).optional(),
  postId: z.string(),
});

const profileDataContentTypes = ['profileImage', 'headerImage'] as const;

const requestProfileDataSchema = z.object({
  contentType: z.union([
    z.literal(profileDataContentTypes[0]),
    z.literal(profileDataContentTypes[1]),
  ]),
  creatorId: z.string(),
});

export const getUploadSignedUrl = https.onCall(async (d, context) => {
  if (!context.auth) {
    throw new https.HttpsError('unauthenticated', 'Need auth');
  }

  const requestType = postDataContentTypes.includes(d.contentType || '')
    ? 'post'
    : profileDataContentTypes.includes(d.contentType || '')
    ? 'profile'
    : null;

  if (!requestType) {
    throw new https.HttpsError('invalid-argument', 'Invalid contentType');
  }

  const data = await (requestType === 'post'
    ? requestPostDataSchema
    : requestProfileDataSchema
  )
    .parseAsync(d)
    .catch(() => {
      throw new https.HttpsError('invalid-argument', 'Invalid argument');
    });

  const creatorRef = db.doc(`/creators/${data.creatorId}`);

  const creatorSnapshot = await creatorRef.get();
  const creatorData = creatorSnapshot.data();
  if (!creatorSnapshot.exists || !creatorData) {
    throw new https.HttpsError(
      'permission-denied',
      'Only creators can execute'
    );
  }

  if (creatorData.creatorAddress !== context.auth.uid) {
    throw new https.HttpsError(
      'permission-denied',
      'Only the creator themselves can access'
    );
  }

  if (!creatorData.isPublic) {
    throw new https.HttpsError(
      'permission-denied',
      'Creator page must be public'
    );
  }

  const creatorStatusRef = creatorRef.collection('status').doc('strikes');
  const creatorStatusSnapshot = await creatorStatusRef.get();

  if (creatorStatusSnapshot.exists) {
    const isBanned = creatorStatusSnapshot.get('isBanned');
    if (isBanned) {
      throw new https.HttpsError(
        'permission-denied',
        'You are not allowed to upload content'
      );
    }
  }

  const maxContentSize = maxContentSizes[data.contentType];
  const Conditions: Conditions[] = [
    ['content-length-range', 1, maxContentSize],
  ];

  if (requestType === 'post') {
    const postData = data as z.infer<typeof requestPostDataSchema>;

    const Bucket = postData.isPublic
      ? process.env.CREATOR_PUBLIC_BUCKET_NAME
      : process.env.CREATOR_LIMITED_PUBLICATION_BUCKET_NAME;

    if (!Bucket) {
      console.error(
        'A valid bucket name does not exist in the environment constants file.'
      );
      throw new https.HttpsError('internal', 'Internal server error');
    }

    const numOfImages: number =
      postData.contentType === 'images' && postData.numOfImages
        ? postData.numOfImages
        : 1;

    const urls: string[] = await Promise.all(
      [...Array(numOfImages)].map(async (_, i) => {
        const Key = `${postData.creatorId}/${postData.postId}/${i}`;
        const { url } = await createPresignedPost(s3, {
          Bucket,
          Conditions,
          Expires,
          Key,
        });
        return url;
      })
    );

    return { urls };
  } else {
    const profileData = data as z.infer<typeof requestProfileDataSchema>;

    const Bucket = process.env.CREATOR_PUBLIC_BUCKET_NAME;
    if (!Bucket) {
      console.error(
        'A valid bucket name does not exist in the environment constants file.'
      );
      throw new https.HttpsError('internal', 'Internal server error');
    }

    const Key = `${profileData.creatorId}/${profileData.contentType}`;

    const { url } = await createPresignedPost(s3, {
      Bucket,
      Conditions,
      Expires,
      Key,
    });

    return { urls: [url] };
  }
});
