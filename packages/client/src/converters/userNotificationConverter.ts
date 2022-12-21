import {
  FirestoreDataConverter,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

import type { NotificationDocData } from '#types/firestore/user/Notification';

export const userNotificationConverter: FirestoreDataConverter<
  WithId<NotificationDocData>
> = {
  fromFirestore: (snapshot, opts) => {
    const data = snapshot.data(opts);
    data.id = snapshot.id;
    data.createdAt = (data.createdAt as Timestamp).toDate();
    return data as WithId<NotificationDocData>;
  },
  toFirestore: ({ createdAt, creatorId, customMessage, type }) => {
    if (!creatorId || !type) {
      throw Error('Invalid data.');
    }
    return {
      createdAt: createdAt
        ? Timestamp.fromDate(createdAt as Date)
        : serverTimestamp(),
      creatorId,
      customMessage,
      type,
    };
  },
};