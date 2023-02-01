type CreatorPostDocData = {
  contentsType: CreatorPostDocDataContentsType;
  contents: {
    url: string;
    description?: string;
  }[];
  thumbnailUrl: string;
  title: string;
  updatedAt: Date;
  createdAt: Date;
  borderLockAddress: string;
  customUrl: string;
  description?: string;
};

type CreatorPostDocDataContentsType = 'audio' | 'text' | 'images' | 'video';
