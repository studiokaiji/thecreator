type SupportingCreatorDocData = {
  creatorId: string;
  plan: SupportingCreatorDocDataPlan;
  notificationSettings: NotificationSettings;
  supportedAt: Date;
};

type SupportingCreatorDocDataPlan = {
  name: string;
  lockAddress: string;
};
