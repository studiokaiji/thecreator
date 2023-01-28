type CreatorDocData = {
  creatorAddress: string;
  creatorName: string;
  description: string;
  pinningPostId: string;
  updatedAt: Date;
  createdAt: Date;
  settings: CreatorDocSettings;
  planIds: string[];
  headerImageSrc: string;
  iconImageSrc: string;
};

type CreatorDocSettings = {
  isNSFW: boolean;
  isPublish: boolean;
};
