import { https } from 'firebase-functions';
import { z } from 'zod';

import { db, s3 } from '@/instances';
import { getUserId } from '@/middleware/getUserId';
import {
  CREATOR_LIMITED_PUBLICATION_BUCKET_NAME,
  CREATOR_PUBLIC_BUCKET_NAME,
} from '@/constants';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import {
  maxContentLengths,
  postDataContentTypes,
  validContentTypes,
  uploadPresignedUrlExpiresIn,
} from '@/settings';

const contentInfoListSchema = z
  .object({
    contentLength: z.number(),
    contentType: z.string(),
  })
  .array()
  .min(1)
  .max(30);

const requestPostDataSchema = z.object({
  contentsType: z.union([
    z.literal(postDataContentTypes[0]),
    z.literal(postDataContentTypes[1]),
    z.literal(postDataContentTypes[2]),
    z.literal(postDataContentTypes[3]),
  ]),
  creatorId: z.string(),
  isPublic: z.boolean().optional(),
  contentInfoList: contentInfoListSchema,
  postId: z.string(),
});

const profileDataContentTypes = ['iconImage', 'headerImage'] as const;

const requestProfileDataSchema = z.object({
  contentsType: z.union([
    z.literal(profileDataContentTypes[0]),
    z.literal(profileDataContentTypes[1]),
  ]),
  creatorId: z.string(),
  contentInfoList: contentInfoListSchema,
});

export const getUploadSignedUrl = https.onCall(async (d, context) => {
  const userId = getUserId(context);

  if (!userId) {
    throw new https.HttpsError('unauthenticated', 'Need auth');
  }

  // Validation of request
  const requestType = postDataContentTypes.includes(d.contentsType || '')
    ? 'post'
    : profileDataContentTypes.includes(d.contentsType || '')
    ? 'profile'
    : null;

  if (!requestType) {
    throw new https.HttpsError('invalid-argument', 'Invalid contentsType');
  }

  const data = await (requestType === 'post'
    ? requestPostDataSchema
    : requestProfileDataSchema
  )
    .parseAsync(d)
    .catch(() => {
      throw new https.HttpsError('invalid-argument', 'Invalid argument');
    });

  if (data.contentsType !== 'images' && data.contentInfoList.length > 1) {
    throw new https.HttpsError('invalid-argument', 'Invalid contents count');
  }

  // Content check
  const maxContentLength = maxContentLengths[data.contentsType];
  const validContentType: string[] = [...validContentTypes[data.contentsType]];

  const contentLengths: number[] = [];
  const contentTypes: string[] = [];

  for (const { contentLength, contentType } of data.contentInfoList) {
    const isOk =
      contentLength <= maxContentLength &&
      validContentType.includes(contentType);

    if (!isOk) {
      throw new https.HttpsError('invalid-argument', 'Invalid content info');
    }

    contentLengths.push(contentLength);
    contentTypes.push(contentType);
  }

  // Creator check
  const creatorRef = db.doc(`/creators/${data.creatorId}`);

  const creatorSnapshot = await creatorRef.get();
  const creatorData = creatorSnapshot.data();
  if (!creatorSnapshot.exists || !creatorData) {
    throw new https.HttpsError(
      'permission-denied',
      'Only creators can execute'
    );
  }

  if (creatorData.creatorAddress !== userId) {
    throw new https.HttpsError(
      'permission-denied',
      'Only the creator themselves can access'
    );
  }

  if (!creatorData.settings.isPublish) {
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

  // Generate URL(s)
  if (requestType === 'post') {
    const postData = data as z.infer<typeof requestPostDataSchema>;

    const Bucket = postData.isPublic
      ? CREATOR_PUBLIC_BUCKET_NAME
      : CREATOR_LIMITED_PUBLICATION_BUCKET_NAME;

    const returnData = await Promise.all(
      contentLengths.map(async (ContentLength, i) => {
        const Key = `${postData.creatorId}/${postData.postId}/${i}`;

        const ContentType = contentTypes[i];

        const url = await getSignedUrl(
          s3,
          new PutObjectCommand({
            Bucket,
            Key,
            ContentLength,
            ContentType,
          }),
          { expiresIn: uploadPresignedUrlExpiresIn }
        );
        return { key: Key, url };
      })
    );

    return returnData;
  } else {
    const profileData = data as z.infer<typeof requestProfileDataSchema>;

    const Bucket = process.env.CREATOR_PUBLIC_BUCKET_NAME;

    const Key = `${profileData.creatorId}/${
      profileData.contentsType
    }/${new Date().getTime()}`;

    const ContentLength = contentLengths[0];
    const ContentType = contentTypes[0];

    const url = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket,
        Key,
        ContentLength,
        ContentType,
      }),
      { expiresIn: uploadPresignedUrlExpiresIn }
    );

    return [{ key: Key, url }];
  }
});
