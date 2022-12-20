export type CreatorDocData = {
  creatorAddress: string;
  creatorName: string;
  description: string;
  pinningPostId: string;
  updatedAt: Date;
  createdAt: Date;
  settings: CreatorDocSettings;
};

export type CreatorDocSettings = {
  isNSFW: boolean;
  isPublish: boolean;
};
