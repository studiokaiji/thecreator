import type { NotificationSettings } from './Notification';

export type FollowingCreatorDocData = {
  plan: FollowingCreatorDocDataPlan;
  notificationSettings: NotificationSettings;
  followedAt: Date;
};

export type FollowingCreatorDocDataPlan = {
  name: string;
  lockAddress: string;
  expiringAt: Date;
};
