export type CreatorDocData = {
  creatorAddress: string;
  creatorName: string;
  description: string;
  pinningPostId: string;
  updatedAt: Date;
  createdAt: Date;
  id: string;
  plans: { [key: number]: CreatorDocDataPlan };
};

export type CreatorDocDataPlan = {
  lockAddress: string;
  name: string;
  description: string;
  features: string[];
  priceEthPerMonth: number;
  currency: string;
  txHash: string;
};
