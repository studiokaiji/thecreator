import { S3Client } from '@aws-sdk/client-s3';
import * as firebaseAdmin from 'firebase-admin';
import * as functions from 'firebase-functions';

export const functionsConfig = functions.config();

export const s3 = new S3Client({
  credentials: {
    accessKeyId: functionsConfig.r2.accountId,
    secretAccessKey: functionsConfig.r2.secretKey,
  },
  endpoint: functionsConfig.r2.endpoint,
  region: 'auto',
});

export const admin = firebaseAdmin.initializeApp();

export const db = admin.firestore();
export const rtdb = admin.database();
export const auth = admin.auth();
