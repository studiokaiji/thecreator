type CreatorPostDocData = {
  contentsType: CreatorPostDocDataContentsType;
  contentUrls: string[];
  thumbnailUrl: string;
  title: string;
  description: string;
  updatedAt: Date;
  createdAt: Date;
  borderLockAddress: string;
  customUrl: string;
};

type CreatorPostDocDataContentsType = 'audio' | 'text' | 'images' | 'video';
