import { toBytes } from './utils/toBytes';

export const postDataContentTypes = [
  'images',
  'audio',
  'text',
  'attachedImage',
] as const;

export const maxContentLengths = {
  images: toBytes(10, 'MB'),
  audio: toBytes(300, 'MB'),
  text: toBytes(10, 'MB'),
  attachedImage: toBytes(10, 'MB'),
  profileImage: toBytes(10, 'MB'),
  headerImage: toBytes(20, 'MB'),
} as const;

const imageValidContentTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
] as const;

export const validContentTypes = {
  images: imageValidContentTypes,
  audio: ['audio/mp3', 'audio/aac'],
  text: ['text/html', 'text/htm'],
  attachedImage: imageValidContentTypes,
  profileImage: imageValidContentTypes,
  headerImage: imageValidContentTypes,
} as const;

export const uploadPresignedUrlExpiresIn = 180;
