import { Timestamp } from 'firebase-admin/firestore';
import {
  collection,
  doc,
  FirestoreDataConverter,
  serverTimestamp,
} from 'firebase/firestore';

import type { FollowingCreatorDocData } from '#types/firestore/user/FollowingCreator';
import { db } from '@/firebase';

export const userFollowingCreatorConverter: FirestoreDataConverter<
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

export const getUserFollowingCreatorsCollectionRef = (id: string) =>
  collection(db, 'users', id, 'followingCreators');

export const getUserFollowingCreatorDocRef = (
  id: string,
  notificationId: string
) => doc(db, 'users', id, 'followingCreators', notificationId);
