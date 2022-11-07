import { Timestamp } from 'firebase/firestore';

export type CreatorDocData = {
  contractAddress: string;
  creatorName: string;
  description: string;
  pinningPostId: string;
  createdAt: Timestamp;
};
