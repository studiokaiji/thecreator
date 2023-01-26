import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import Avatar, { AvatarProps } from '@mui/material/Avatar';
import Box, { BoxProps } from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import { ChangeEvent, useState } from 'react';

import { ImageCropper } from '@/components/helpers/ImageCropper';
import { useImage, UseImageData } from '@/hooks/useImage';

type PictureUploaderProps = {
  header?: BoxProps<'img'>;
  icon?: AvatarProps;
  onChangeHeader: (header: UseImageData) => void;
  onChangeIcon: (icon: UseImageData) => void;
};

const headerImageHeight = 210;
const creatorIconSize = 120;

export const PictureUploader = ({ header, icon }: PictureUploaderProps) => {
  const [headerImage, setheaderImage] = useState<UseImageData>();
  const [iconImage, setIconImage] = useState<UseImageData>();
  const [isCroppingIconImage, setIsCroppingIconImage] = useState(false);

  const { createImage } = useImage();

  const onChangeFileHandler = (
    e: ChangeEvent<HTMLInputElement>,
    type: 'iconImage' | 'headerImage'
  ) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    const image = createImage(file, type);

    if (type === 'iconImage') {
      setIconImage(image);
      setIsCroppingIconImage(true);
    } else {
      setheaderImage(image);
    }
  };

  const onCroppedIconImageHandler = (image: UseImageData) => {
    setIconImage(image);
    setIsCroppingIconImage(false);
  };

  if (isCroppingIconImage && iconImage) {
    return (
      <Dialog
        fullWidth
        hideBackdrop
        maxWidth="sm"
        onClose={() => setIsCroppingIconImage(false)}
        open={isCroppingIconImage}
        sx={{ p: 0 }}
      >
        <DialogTitle>Crop Image</DialogTitle>
        <ImageCropper
          aspect={1}
          image={iconImage}
          onCancel={() => setIsCroppingIconImage(false)}
          onCropped={onCroppedIconImageHandler}
        />
      </Dialog>
    );
  }

  return (
    <Box
      sx={{
        height: headerImageHeight,
        mb: `${creatorIconSize / 2.5}px`,
        position: 'relative',
      }}
    >
      <Box
        sx={{
          backgroundColor: 'lightgray',
          filter: 'brightness(85%)',
          height: '100%',
          userSelect: 'none',
          width: '100%',
        }}
      >
        <Box
          component="img"
          {...header}
          src={headerImage?.url || header?.src}
          sx={{ height: '100%', objectFit: 'cover', width: '100%' }}
        />
        <AddPhotoIconButton
          name="header"
          onChange={(e) => onChangeFileHandler(e, 'headerImage')}
        />
      </Box>
      <Box
        sx={{
          borderRadius: '50%',
          bottom: (creatorIconSize / 2.5) * -1,
          filter: 'brightness(85%)',
          height: creatorIconSize,
          left: `calc(50% - ${creatorIconSize / 2}px)`,
          position: 'absolute',
          width: creatorIconSize,
          zIndex: 20,
        }}
      >
        <Avatar
          sx={{
            border: '2px solid white',
            height: '100%',
            width: '100%',
          }}
          {...icon}
          src={iconImage?.url || icon?.src}
        />
        <AddPhotoIconButton
          name="icon"
          onChange={(e) => onChangeFileHandler(e, 'iconImage')}
        />
      </Box>
    </Box>
  );
};

const AddPhotoIconButton = (props: JSX.IntrinsicElements['input']) => {
  const id = `upload-button-${props.name}`;
  return (
    <label
      htmlFor={id}
      style={{
        left: '50%',
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%) translateX(-50%)',
      }}
    >
      <input
        accept="image/*"
        id={id}
        name={props.name}
        onChange={props.onChange}
        type="file"
        {...props}
        style={{
          ...props.style,
          display: 'none',
        }}
      />
      <IconButton
        component="span"
        sx={{
          ':hover': {
            background: 'rgba(0,0,0,0.65)',
          },
          background: 'rgba(0,0,0,0.45)',
        }}
      >
        <AddPhotoAlternateIcon htmlColor="white" />
      </IconButton>
    </label>
  );
};
