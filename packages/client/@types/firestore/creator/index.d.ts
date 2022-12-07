export type CreatorDocData = {
  creatorAddress: string;
  creatorName: string;
  description: string;
  pinningPostId: string;
  updatedAt: Date;
  createdAt: Date;
  id: string;
  plans: CreatorDocDataPlan[];
};

export type CreatorDocDataPlan = {
  lockAddress: string;
  name: string;
  description: string;
  features: string[];
  pricePerMonth: number;
  currency: string;
};
