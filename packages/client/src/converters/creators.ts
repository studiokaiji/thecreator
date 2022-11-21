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

export const creatorConverter: FirestoreDataConverter<WithId<CreatorDocData>> =
  {
    fromFirestore: (
      snapshot: QueryDocumentSnapshot,
      opts: SnapshotOptions
    ): WithId<CreatorDocData> => {
      const data = snapshot.data(opts);
      data.updatedAt = (data.updatedAt as Timestamp).toDate();
      data.id = snapshot.id;
      return data as WithId<CreatorDocData>;
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
