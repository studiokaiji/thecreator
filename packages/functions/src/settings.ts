import { toBytes } from './utils/toBytes';

export const maxContentSizes = {
  images: toBytes(5, 'MB'),
  audio: toBytes(300, 'MB'),
  text: toBytes(10, 'MB'),
  attachedImage: toBytes(5, 'MB'),
};
