import { db } from '@/instances';
import { chunk } from '@/utils/chunk';
import { firestore } from 'firebase-functions';

export const onCreatePost = firestore
  .document('/creators/{creatorId}/posts/{postId}')
  .onCreate(async (snapshot, ctx) => {
    const supportersRef = db
      .collectionGroup('supportigCreatorPlans')
      .where('creatorId', '==', ctx.params.creatorId)
      .where('notificationSettings.supportedCreatorNewPost', '==', true);

    const supportersSnapshot = await supportersRef.get();

    const supporterIds = supportersSnapshot.docs.map(
      ({ ref }) => ref.path.split('/')[2]
    );

    for (const chunked of chunk(supporterIds)) {
      const batch = db.batch();

      chunked.forEach((id) => {
        const ref = db
          .collection('users')
          .doc(id)
          .collection('notifications')
          .doc(ctx.params.postId);

        const data: Omit<NotificationDocData, 'createdAt'> & {
          createdAt: FirebaseFirestore.Timestamp;
        } = {
          type: 'newPost',
          creatorId: ctx.params.creatorId,
          createdAt: snapshot.createTime,
          post: {
            title: snapshot.get('title'),
            id: snapshot.id,
          },
        };

        batch.create(ref, data);
      });

      await batch.commit();
    }
  });
