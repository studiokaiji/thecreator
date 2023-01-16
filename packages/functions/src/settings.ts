import { toBytes } from './utils/toBytes';

export const maxContentSizes = {
  images: toBytes(10, 'MB'),
  audio: toBytes(300, 'MB'),
  text: toBytes(10, 'MB'),
  attachedImage: toBytes(10, 'MB'),
  profileImage: toBytes(10, 'MB'),
  headerImage: toBytes(20, 'MB'),
};
