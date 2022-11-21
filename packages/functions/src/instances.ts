import { S3Client } from '@aws-sdk/client-s3';
import * as firebaseAdmin from 'firebase-admin';

export const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.R2_ACCOUNT_ID || '',
    secretAccessKey: 'SECRET_ACCESS_KEY',
  },
  endpoint: `https://${
    process.env.R2_ACCOUNT_ID || ''
  }.r2.cloudflarestorage.com`,
  region: 'auto',
});

export const admin = firebaseAdmin.initializeApp();

export const db = admin.firestore();
export const rtdb = admin.database();
export const auth = admin.auth();
