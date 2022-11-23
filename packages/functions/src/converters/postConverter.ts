import { FirestoreDataConverter, Timestamp } from 'firebase-admin/firestore';

const validContentsTypes = ['audio', 'text', 'images'];

export type PostDocument<T extends Date | Timestamp = Date> = {
  contentsType: 'audio' | 'text' | 'images';
  contentsCount: number;
  planId: string;
  title: string;
  description: string;
  updatedAt: T;
  createdAt: T;
};

export const postConverter: FirestoreDataConverter<PostDocument> = {
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
    };
  },
  toFirestore: (data) => {
    return data;
  },
};
