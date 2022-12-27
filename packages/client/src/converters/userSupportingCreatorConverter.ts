import {
  collection,
  doc,
  FirestoreDataConverter,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

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
  toFirestore: ({ lockAddress, notificationSettings, supportedAt }) => {
    if (!lockAddress || !notificationSettings) {
      throw Error('Invalid data.');
    }
    return {
      lockAddress,
      notificationSettings,
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

export const getUserSupportingCreatorDocRef = (id: string, creatorId: string) =>
  doc(db, 'users', id, 'supportingCreators', creatorId).withConverter(
    userSupportingCreatorConverter
  );
