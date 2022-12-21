import type { NotificationSettings } from './Notification';

export type SupportingCreatorDocData = {
  plan: SupportingCreatorDocDataPlan;
  notificationSettings: NotificationSettings;
  supportedAt: Date;
};

export type SupportingCreatorDocDataPlan = {
  name: string;
  lockAddress: string;
};
