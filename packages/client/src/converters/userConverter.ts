import { FirestoreDataConverter } from 'firebase/firestore';

import { UserDocData } from '#types/firestore/user';

export const userConverter: FirestoreDataConverter<WithId<UserDocData>> = {
  fromFirestore: (snapshot, opts) => {
    const data = snapshot.data(opts);
    data.id = snapshot.id;
    return data as WithId<UserDocData>;
  },
  toFirestore: ({ globalNotificationSettings }) => {
    return {
      globalNotificationSettings: globalNotificationSettings || {
        oneWeekBeforeExpiration: true,
        subscripionExpired: true,
        supportedCreatorNewPost: true,
      },
    };
  },
};
