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
      creatorAddress,
      creatorName,
      description,
      pinningPostId,
    }) => {
      if (!creatorAddress || !creatorName || !description || !pinningPostId) {
        throw Error('Required values are not specified.');
      }
      return {
        createdAt: serverTimestamp(),
        creatorAddress,
        creatorName,
        description,
        pinningPostId,
      };
    },
  };

export const getCreatorsCollectionRef = () =>
  collection(db, 'creators').withConverter(creatorConverter);

export const getCreatorDocRef = (contractAddress: string) =>
  doc(db, 'creators', contractAddress).withConverter(creatorConverter);
