import {
  collection,
  doc,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from 'firebase/firestore';

import { db } from '../firebase';

import { CreatorPlanDoc } from '#types/firestore/creator/plan';

export const creatorPlanConverter: FirestoreDataConverter<
  WithId<CreatorPlanDoc>
> = {
  fromFirestore: (
    snapshot: QueryDocumentSnapshot,
    opts: SnapshotOptions
  ): WithId<CreatorPlanDoc> => {
    const data = snapshot.data(opts);
    data.id = snapshot.id;
    return data as WithId<CreatorPlanDoc>;
  },
  toFirestore: ({ description, features, lockAddress, name, txHash }) => {
    return {
      description: description || '',
      features: features || [],
      lockAddress: lockAddress || '',
      name: name || '',
      txHash: txHash || '',
    };
  },
};

export const getCreatorPlansCollectionRef = (id: string) =>
  collection(db, 'creators', id, 'plans').withConverter(creatorPlanConverter);

export const getCreatorPlanDocRef = (id: string, planId: string) =>
  doc(db, 'creators', id, planId).withConverter(creatorPlanConverter);
