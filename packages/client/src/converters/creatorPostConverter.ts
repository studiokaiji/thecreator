import {
  collection,
  doc,
  FirestoreDataConverter,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

import { db } from '@/firebase';

export const creatorPostConverter: FirestoreDataConverter<
  WithId<CreatorPostDocData>
> = {
  fromFirestore: (snapshot, opts) => {
    const data = snapshot.data(opts);
    data.updatedAt = (data.updatedAt as Timestamp).toDate();
    data.createdAt = (data.createdAt as Timestamp).toDate();
    data.id = snapshot.id;
    return data as WithId<CreatorPostDocData>;
  },
  toFirestore: (data) => {
    const updatedAt = serverTimestamp();
    return {
      borderLockAddress: data.borderLockAddress,
      contents: data.contents,
      contentsType: data.contentsType,
      createdAt: data.createdAt,
      thumbnailUrl: data.thumbnailUrl,
      title: data.title,
      updatedAt,
    };
  },
};

export const getCreatorPostsCollectionRef = (id: string) =>
  collection(db, 'creators', id, 'posts').withConverter(creatorPostConverter);

export const getCreatorPostDocRef = (id: string, postId: string) =>
  doc(db, 'creators', id, 'posts', postId).withConverter(creatorPostConverter);
