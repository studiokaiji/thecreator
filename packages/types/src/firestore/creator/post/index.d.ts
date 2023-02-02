type CreatorPostDocData = {
  contentsType: CreatorPostDocDataContentsType;
  contents: {
    url?: string;
    key?: string;
    description?: string;
  }[];
  thumbnailUrl: string;
  title: string;
  updatedAt: Date;
  createdAt: Date;
  borderLockAddress: string;
};

type CreatorPostDocDataContentsType = 'audio' | 'text' | 'images' | 'video';
