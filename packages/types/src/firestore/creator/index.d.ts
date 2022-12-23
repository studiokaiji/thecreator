type CreatorDocData = {
  creatorAddress: string;
  creatorName: string;
  description: string;
  pinningPostId: string;
  updatedAt: Date;
  createdAt: Date;
  settings: CreatorDocSettings;
};

type CreatorDocSettings = {
  isNSFW: boolean;
  isPublish: boolean;
};
