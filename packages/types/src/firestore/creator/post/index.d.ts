type CreatorPostDocData = {
  contentsType: CreatorPostDocDataContentsType;
  contentsCount: number;
  planId: string;
  title: string;
  description: string;
  updatedAt: Date;
  createdAt: Date;
  borderLockAddress: string;
};

type CreatorPostDocDataContentsType = 'audio' | 'text' | 'images';
