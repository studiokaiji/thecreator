import { Timestamp, FirestoreDataConverter } from 'firebase/firestore';

const validContentsTypes = ['audio', 'text', 'images'];

export const postConverter: FirestoreDataConverter<CreatorPostDocData> = {
  fromFirestore: (snapshot) => {
    const data = snapshot.data();

    const filtered = validContentsTypes.filter((c) => c === data.contentsType);
    if (filtered.length < 1) {
      throw Error('Invalid contentsType');
    }

    return {
      contentsCount: data.contentsCount,
      contentsType: data.contentsType,
      description: data.description,
      updatedAt: (data.updatedAt as Timestamp).toDate(),
      planId: data.planId,
      title: data.title,
      createdAt: (data.createdAt as Timestamp).toDate(),
      borderLockAddress: data.borderLockAddress,
    };
  },
  toFirestore: (data) => {
    return data;
  },
};
