import type { NotificationSettings } from './Notification';

export type FollowingCreatorDocData = {
  plan: FollowingCreatorDocDataPlan;
  notificatonSettings: NotificationSettings;
};

export type FollowingCreatorDocDataPlan = {
  name: string;
  lockAddress: string;
  expiringAt: Date;
};
