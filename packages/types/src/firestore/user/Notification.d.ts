type NotificationDocDataType =
  | 'newPost'
  | 'subscriptionExpired'
  | 'oneWeekBeforeExpiration'
  | 'message';

type NotificationDocData = {
  type: NotificationDocDataType;
  creatorId: string;
  createdAt: Date;
  customMessage?: string;
  planId?: string;
  postTitle?: string;
};

type NotificationSettings = {
  supportedCreatorNewPost: boolean;
  subscriptionExpired: boolean;
  oneWeekBeforeExpiration: boolean;
};
