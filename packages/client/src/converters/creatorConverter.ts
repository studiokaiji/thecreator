import {
  collection,
  doc,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  serverTimestamp,
  SnapshotOptions,
  Timestamp,
} from 'firebase/firestore';

import { db } from '../firebase';

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
    toFirestore: (data) => {
      return {
        createdAt: data.createdAt
          ? Timestamp.fromDate(data.createdAt as Date)
          : undefined,
        creatorAddress: data.creatorAddress || '',
        creatorName: data.creatorName || '',
        description: data.description || '',
        pinningPostId: data.pinningPostId || '',
        settings: data.settings || { isNSFW: false, isPublish: true },
        updatedAt: serverTimestamp(),
      };
    },
  };

export const getCreatorsCollectionRef = () =>
  collection(db, 'creators').withConverter(creatorConverter);

export const getCreatorDocRef = (contractAddress: string) =>
  doc(db, 'creators', contractAddress).withConverter(creatorConverter);
