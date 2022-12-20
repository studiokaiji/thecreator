export type FollowingCreatorDocData = {
  plan: FollowingCreatorDocDataPlan;
  notificatonSettings: FollowingCreatorDocDataNotificationSettings;
};

export type FollowingCreatorDocDataPlan = {
  name: string;
  lockAddress: string;
  expiringAt: Date;
};

export type FollowingCreatorDocDataNotificationSettings = {
  [key in keyof UserDocDataGlobalNotificationSettings]: boolean;
};
