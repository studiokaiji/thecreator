import {
  collection,
  doc,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  serverTimestamp,
  SnapshotOptions,
} from 'firebase/firestore';

import { db } from './../firebase';

import type { CreatorDocData } from '#types/firestore/creator';

export const creatorConverter: FirestoreDataConverter<Partial<CreatorDocData>> =
  {
    fromFirestore: (snapshot: QueryDocumentSnapshot, opts: SnapshotOptions) => {
      return snapshot.data(opts) as CreatorDocData;
    },
    toFirestore: ({
      contractAddress,
      creatorName,
      description,
      pinningPostId,
      txHash,
    }) => {
      return {
        contractAddress,
        createdAt: serverTimestamp(),
        creatorName,
        description,
        pinningPostId,
        txHash,
      };
    },
  };

export const getCreatorsCollectionRef = () =>
  collection(db, 'creators').withConverter(creatorConverter);

export const getCreatorDocRef = (address: string) =>
  doc(db, 'creators', address).withConverter(creatorConverter);