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
};

type NotificationSettings = {
  supportedCreatorNewPost: boolean;
  subscripionExpired: boolean;
  oneWeekBeforeExpiration: boolean;
};