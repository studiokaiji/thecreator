import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import ClearIcon from '@mui/icons-material/Clear';
import { Dialog, DialogTitle } from '@mui/material';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/system';
import { ChangeEvent, useRef, useState } from 'react';

import { ImageCropper } from '@/components/helpers/ImageCropper';
import { useImage, UseImageData } from '@/hooks/useImage';

type PictureUploaderProps = {
  src?: string;
  onChange: (header: UseImageData) => void;
};

export const EditorHeaderImage = ({ onChange, src }: PictureUploaderProps) => {
  const [headerImage, setHeaderImage] = useState<UseImageData | null>(null);
  const [isRemovedHeader, setIsRemovedHeader] = useState(false);
  const [isCroppingImage, setIsCroppingImage] = useState(false);

  const { createImage } = useImage();

  const onChangeFileHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    const image = createImage(file, 'images');
    setHeaderImage(image);
    setIsRemovedHeader(false);

    setIsCroppingImage(true);
  };

  const onCroppedIconImageHandler = (image: UseImageData) => {
    setHeaderImage(image);
    setIsCroppingImage(false);
    onChange(image);
  };

  const onCancelCrop = () => {
    setHeaderImage(null);
    setIsRemovedHeader(true);
    setIsCroppingImage(false);
  };

  const removeHeaderImage = () => {
    setHeaderImage(null);
    setIsRemovedHeader(true);
  };

  const inputRef = useRef<HTMLInputElement>(null);

  const onClickSelectImageButtonHandler = () => {
    inputRef?.current?.click();
  };

  if (isCroppingImage && headerImage) {
    return (
      <Dialog
        fullWidth
        maxWidth="sm"
        onClose={onCancelCrop}
        open={isCroppingImage}
        sx={{ p: 0 }}
      >
        <DialogTitle>Crop Image</DialogTitle>
        <ImageCropper
          aspect={960 / 640}
          image={headerImage}
          onCancel={onCancelCrop}
          onCropped={onCroppedIconImageHandler}
        />
      </Dialog>
    );
  }

  return (
    <Box
      sx={{
        height: '100%',
        userSelect: 'none',
        width: '100%',
      }}
    >
      <Box>
        <Box sx={{ position: 'relative' }}>
          <Box
            component="img"
            src={isRemovedHeader ? '' : headerImage?.url || src}
            sx={{
              display:
                !isRemovedHeader && (headerImage?.url || src)
                  ? 'block'
                  : 'hidden',
              objectFit: 'cover',
              width: '100%',
            }}
          />
          {headerImage && (
            <ActionIconButton
              onClick={removeHeaderImage}
              sx={{ position: 'absolute', right: 24, top: 24 }}
            >
              <ClearIcon htmlColor="white" />
            </ActionIconButton>
          )}
        </Box>
        {!headerImage && (
          <>
            <input
              ref={inputRef}
              accept="image/*"
              onChange={onChangeFileHandler}
              style={{
                display: 'none',
              }}
              type="file"
            />
            <ActionIconButton
              onClick={onClickSelectImageButtonHandler}
              sx={{ position: 'absolute' }}
            >
              <AddPhotoAlternateIcon htmlColor="white" />
            </ActionIconButton>
          </>
        )}
      </Box>
    </Box>
  );
};

const ActionIconButton = styled(IconButton)({
  ':hover': {
    background: 'rgba(0,0,0,0.25)',
  },
  background: 'rgba(0,0,0,0.15)',
});
