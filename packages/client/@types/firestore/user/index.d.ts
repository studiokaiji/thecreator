export type UserDocData = {
  globalNotificationSettings: UserDocGlobalNotificationSettings;
};

export type UserDocDataGlobalNotificationSettings = {
  supportedCreatorNewPost: GloablNotificatonSettings;
  subscripionExpired: GloablNotificatonSettings;
  oneWeekBeforeExpiration: GloablNotificatonSettings;
};

export type GloablNotificatonSettings = {
  client: boolean;
  email: boolean;
};
