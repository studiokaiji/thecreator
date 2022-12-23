import { collection, doc, FirestoreDataConverter } from 'firebase/firestore';

import { db } from '@/firebase';

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

export const getUsersCollectionRef = () =>
  collection(db, 'users').withConverter(userConverter);

export const getUserDocRef = (id: string) =>
  doc(db, 'users', id).withConverter(userConverter);
