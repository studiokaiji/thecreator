import { FirestoreDataConverter, Timestamp } from 'firebase-admin/firestore';

const validContentsTypes = ['audio', 'text', 'images'];

export type PostDocument = {
  contentsType: 'audio' | 'text' | 'images';
  contentsCount: number;
  planId: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
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
      createdAt: (data.createdAt as Timestamp).toDate(),
      description: data.description,
      updatedAt: (data.updatedAt as Timestamp).toDate(),
      planId: data.planId,
      title: data.title,
    };
  },
  toFirestore: (data) => {
    return data;
  },
};
