type GetDownloadSignedUrlResponse = {
  borderLockAddress: string;
  postId: string;
  creatorId: string;
  urls: string[];
  expiry: Date;
  contentsType: CreatorPostDocDataContentsType;
}[];
