type CreatorPostDocData = {
  contentsType: CreatorPostDocDataContentsType;
  contentsCount: number;
  title: string;
  description: string;
  updatedAt: Date;
  createdAt: Date;
  borderLockAddress: string;
};

type CreatorPostDocDataContentsType = 'audio' | 'text' | 'images';
