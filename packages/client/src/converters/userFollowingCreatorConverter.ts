import { Timestamp } from 'firebase-admin/firestore';
import { FirestoreDataConverter, serverTimestamp } from 'firebase/firestore';

import type { FollowingCreatorDocData } from '#types/firestore/user/FollowingCreator';

export const userNotificationConverter: FirestoreDataConverter<
  WithId<FollowingCreatorDocData>
> = {
  fromFirestore: (snapshot, opts) => {
    const data = snapshot.data(opts);
    data.id = snapshot.id;
    data.followedAt = data.followedAt.toDate();
    data.plan.expiringAt = data.plan.expiringAt.toDate();
    return data as WithId<FollowingCreatorDocData>;
  },
  toFirestore: ({ followedAt, notificationSettings, plan }) => {
    if (!plan || !notificationSettings) {
      throw Error('Invalid data.');
    }
    return {
      followedAt: followedAt
        ? Timestamp.fromDate(followedAt as Date)
        : serverTimestamp(),
      notificationSettings,
      plan,
    };
  },
};
