export type CreatorDocData = {
  creatorAddress: string;
  creatorName: string;
  description: string;
  pinningPostId: string;
  updatedAt: Date;
  createdAt: Date;
  id: string;
  settings: CreatorDocSettings;
};

export type CreatorDocSettings = {
  isNSFW: boolean;
  isPublish: boolean;
};
