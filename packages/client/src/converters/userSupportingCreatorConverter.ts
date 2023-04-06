import {
  collection,
  doc,
  FirestoreDataConverter,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

import { db } from '@/firebase';

export const userSupportingCreatorPlanConverter: FirestoreDataConverter<
  WithId<SupportingCreatorPlanDocData>
> = {
  fromFirestore: (snapshot, opts) => {
    const data = snapshot.data(opts);
    data.id = snapshot.id;
    data.supportedAt = data.supportedAt.toDate();
    return data as WithId<SupportingCreatorPlanDocData>;
  },
  toFirestore: ({
    creatorId,
    lockAddress,
    notificationSettings,
    supportedAt,
  }) => {
    if (!lockAddress || !notificationSettings) {
      throw Error('Invalid data.');
    }
    return {
      creatorId: creatorId,
      lockAddress,
      notificationSettings,
      supportedAt: supportedAt
        ? Timestamp.fromDate(supportedAt as Date)
        : serverTimestamp(),
    };
  },
};

export const getUserSupportingCreatorPlansCollectionRef = (id: string) =>
  collection(db, 'users', id, 'supportingCreatorPlans').withConverter(
    userSupportingCreatorPlanConverter
  );

export const getUserSupportingCreatorPlanDocRef = (
  id: string,
  planId: string
) =>
  doc(db, 'users', id, 'supportingCreatorPlans', planId).withConverter(
    userSupportingCreatorPlanConverter
  );
