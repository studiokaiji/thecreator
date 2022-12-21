import {
  collection,
  doc,
  FirestoreDataConverter,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

import type { SupportingCreatorDocData } from '#types/firestore/user/SupportingCreator';
import { db } from '@/firebase';

export const userSupportingCreatorConverter: FirestoreDataConverter<
  WithId<SupportingCreatorDocData>
> = {
  fromFirestore: (snapshot, opts) => {
    const data = snapshot.data(opts);
    data.id = snapshot.id;
    data.supportedAt = data.supportedAt.toDate();
    return data as WithId<SupportingCreatorDocData>;
  },
  toFirestore: ({ notificationSettings, plan, supportedAt }) => {
    if (!plan || !notificationSettings) {
      throw Error('Invalid data.');
    }
    return {
      notificationSettings,
      plan,
      supportedAt: supportedAt
        ? Timestamp.fromDate(supportedAt as Date)
        : serverTimestamp(),
    };
  },
};

export const getUserSupportingCreatorsCollectionRef = (id: string) =>
  collection(db, 'users', id, 'supportingCreators').withConverter(
    userSupportingCreatorConverter
  );

export const getUserSupportingCreatorDocRef = (
  id: string,
  notificationId: string
) =>
  doc(db, 'users', id, 'supportingCreators', notificationId).withConverter(
    userSupportingCreatorConverter
  );
