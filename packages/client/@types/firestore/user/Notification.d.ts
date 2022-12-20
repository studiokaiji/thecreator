export type NotificationDocDataType =
  | 'newPost'
  | 'subscriptionExpired'
  | 'oneWeekBeforeExpiration'
  | 'message';

export type NotificationDocData = {
  type: NotificationDocDataType;
  creatorId: string;
  createdAt: Date;
  customMessage?: string;
};

export type NotificationSettings = {
  supportedCreatorNewPost: boolean;
  subscripionExpired: boolean;
  oneWeekBeforeExpiration: boolean;
};