import { Timestamp } from 'firebase/firestore';

export type CreatorDocData = {
  creatorAddress: string;
  creatorName: string;
  description: string;
  pinningPostId: string;
  createdAt: Timestamp;
};
