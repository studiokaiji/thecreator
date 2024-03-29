import Stack from '@mui/material/Stack';
import { ChangeEvent, useState } from 'react';

import { EditorBody } from './Body';
import { EditorHeaderImage } from './HeaderImage';
import { EditorTitle } from './Title';

import { UseImageData } from '@/hooks/useImage';

export type EditorData = {
  bodyMarkdown: string;
  thumbnail?: UseImageData;
  title: string;
};

type EditorProps = {
  saved?: Omit<EditorData, 'thumbnail'> & { thumbnailUrl: string };
  onChange: (data: EditorData) => void;
};

export const Editor = ({
  onChange,
  saved = { bodyMarkdown: '', thumbnailUrl: '', title: '' },
}: EditorProps) => {
  const [headerImage, setHeaderImage] = useState<UseImageData | undefined>();
  const [title, setTitle] = useState(saved.title || '');
  const [bodyMarkdown, setBodyMarkdown] = useState(saved.bodyMarkdown || '');

  const onChangeHeaderImageHandler = (image: UseImageData) => {
    setHeaderImage(image);
    onChange({ bodyMarkdown, thumbnail: image, title });
  };

  const onChangeTitleHandler = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    onChange({ bodyMarkdown, thumbnail: headerImage, title: newTitle });
  };

  const onChangeBodyHandler = (newBody: string) => {
    setBodyMarkdown(newBody);
    onChange({ bodyMarkdown: newBody, thumbnail: headerImage, title });
  };

  return (
    <Stack spacing={7}>
      <EditorHeaderImage
        onChange={onChangeHeaderImageHandler}
        src={headerImage?.url || saved.thumbnailUrl}
      />
      <EditorTitle onChange={onChangeTitleHandler} value={title} />
      <EditorBody
        defaultBodyMarkdown={saved.bodyMarkdown}
        onChangeBodyMarkdown={onChangeBodyHandler}
      />
    </Stack>
  );
};
