import {
  collection,
  doc,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  serverTimestamp,
  SnapshotOptions,
  Timestamp,
} from 'firebase/firestore';

import { db } from './../firebase';

import type { CreatorDocData } from '#types/firestore/creator';

export const creatorConverter: FirestoreDataConverter<CreatorDocData> = {
  fromFirestore: (snapshot: QueryDocumentSnapshot, opts: SnapshotOptions) => {
    const data = snapshot.data(opts);
    data.updatedAt = (data.updatedAt as Timestamp).toDate();
    return data as CreatorDocData;
  },
  toFirestore: ({
    creatorAddress,
    creatorName,
    description,
    pinningPostId,
  }) => {
    if (!creatorAddress || !creatorName || !description || !pinningPostId) {
      throw Error('Required values are not specified.');
    }
    return {
      creatorAddress,
      creatorName,
      description,
      pinningPostId,
      updatedAt: serverTimestamp(),
    };
  },
};

export const getCreatorsCollectionRef = () =>
  collection(db, 'creators').withConverter(creatorConverter);

export const getCreatorDocRef = (contractAddress: string) =>
  doc(db, 'creators', contractAddress).withConverter(creatorConverter);
