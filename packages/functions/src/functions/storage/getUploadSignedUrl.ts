import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { Conditions } from '@aws-sdk/s3-presigned-post/dist-types/types';
import { https } from 'firebase-functions';
import { z } from 'zod';

import { toBytes } from '../../utils/toBytes';

import { db, s3 } from '@/instances';

const requestDataSchema = z.object({
  contentType: z.union([
    z.literal('images'),
    z.literal('audio'),
    z.literal('text'),
    z.literal('attachedImage'),
  ]),
  contractAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/g),
  isPublic: z.boolean().optional(),
  numOfImages: z.number().min(1).max(30).optional(),
  postId: z.string(),
});

export const getUploadSignedUrl = https.onCall(async (d, context) => {
  if (!context.auth) {
    throw new https.HttpsError('unauthenticated', 'Need auth');
  }

  const data = await requestDataSchema.parseAsync(d).catch(() => {
    throw new https.HttpsError('invalid-argument', 'Invalid argument');
  });

  const creatorRef = db.doc(`/creators/${data.contractAddress}`);

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

  const Bucket = data.isPublic
    ? process.env.CREATOR_PUBLIC_BUCKET_NAME
    : process.env.CREATOR_LIMITED_PUBLICATION_BUCKET_NAME;

  if (!Bucket) {
    console.error(
      'A valid bucket name does not exist in the environment constants file.'
    );
    throw new https.HttpsError('internal', 'Internal server error');
  }

  const maxContentSize =
    data.contentType === 'images' || data.contentType === 'attachedImage'
      ? toBytes(5, 'MB')
      : data.contentType === 'audio'
      ? toBytes(300, 'MB')
      : toBytes(10, 'MB');

  const Conditions: Conditions[] = [
    ['content-length-range', 1, maxContentSize],
  ];

  const numOfImages: number =
    data.contentType === 'images' && data.numOfImages ? data.numOfImages : 1;

  const urls: string[] = await Promise.all(
    [...Array(numOfImages)].map(async (_, i) => {
      const presignedPost = await createPresignedPost(s3, {
        Bucket,
        Conditions,
        Expires: 180,
        Key: `${context.auth?.uid}/${data.postId}/${i}`,
      });
      return presignedPost.url;
    })
  );

  return {
    urls,
  };
});
