import { Timestamp } from 'firebase/firestore';

export type CreatorDocData = {
  contractAddress: string;
  txHash: string;
  creatorName: string;
  description: string;
  pinningPostId: string;
  createdAt: Timestamp;
};
