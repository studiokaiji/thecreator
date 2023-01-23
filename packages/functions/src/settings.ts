import { toBytes } from './utils/toBytes';

export const postDataContentTypes = [
  'images',
  'audio',
  'text',
  'thumbnail',
  'video',
] as const;

export const maxContentLengths: { [type in ContentsType]: number } = {
  images: toBytes(10, 'MB'),
  audio: toBytes(100, 'MB'),
  text: toBytes(10, 'MB'),
  thumbnail: toBytes(10, 'MB'),
  profileImage: toBytes(10, 'MB'),
  headerImage: toBytes(20, 'MB'),
  video: toBytes(300, 'MB'),
} as const;

const imageValidContentTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
];

export const validContentTypes: {
  [type in ContentsType]: string[];
} = {
  images: imageValidContentTypes,
  audio: ['audio/mpeg', 'audio/aac'],
  text: ['text/html', 'text/htm'],
  thumbnail: imageValidContentTypes,
  profileImage: imageValidContentTypes,
  headerImage: imageValidContentTypes,
  video: ['video/mpeg', 'video/mpg', 'video/mp4'],
};

export const uploadPresignedUrlExpiresIn = 180;
