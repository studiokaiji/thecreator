import FormatColorTextIcon from '@mui/icons-material/FormatColorTextOutlined';
import HeadphonesIcon from '@mui/icons-material/HeadphonesOutlined';
import InsertPhotoIcon from '@mui/icons-material/InsertPhotoOutlined';
import VideoLibraryIcon from '@mui/icons-material/VideoLibraryOutlined';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CenterModal } from '@/components/helpers/CenterModal';
import { RoundedButton } from '@/components/helpers/RoundedButton';

type PostTypeButtonLinkProps = {
  icon: ReactNode;
  text: string;
  to: string;
};

const PostTypeButtonLink = ({ icon, text, to }: PostTypeButtonLinkProps) => (
  <ButtonBase
    href={to}
    sx={(theme) => ({
      ':hover': {
        backgroundColor: theme.palette.grey[200],
      },
      height: 80,
      width: '100%',
    })}
  >
    <Box sx={{ mx: 'auto', textAlign: 'center' }}>
      {icon}
      <Typography fontWeight={500}>{text}</Typography>
    </Box>
  </ButtonBase>
);

export const CreateNewPostButton = () => {
  const { t } = useTranslation();

  const postTypes: PostTypeButtonLinkProps[] = [
    {
      icon: <FormatColorTextIcon />,
      text: t('text'),
      to: '/edit/post/text',
    },
    {
      icon: <InsertPhotoIcon />,
      text: t('image'),
      to: '/edit/post/image',
    },
    {
      icon: <VideoLibraryIcon />,
      text: t('video'),
      to: '/edit/post/video',
    },
    {
      icon: <HeadphonesIcon />,
      text: t('audio'),
      to: '/edit/post/audio',
    },
  ];

  const [open, setOpen] = useState(false);

  return (
    <>
      <CenterModal
        maxWidth={540}
        onClose={() => setOpen(false)}
        open={open}
        width="100%"
      >
        <Box>
          <Typography sx={{ lineHeight: 1 }} variant="h5">
            {' '}
            {t('createNewPost')}
          </Typography>
          <Typography color="GrayText" fontWeight={600} sx={{ mt: 3 }}>
            {t('postType')}
          </Typography>
          <Grid container sx={{ mt: 1, width: '100%' }}>
            {postTypes.map((postType) => (
              <Grid
                key={postType.text}
                md={3}
                sx={{
                  border: '1px solid',
                  borderColor: 'lightgray',
                  ml: '-1px',
                }}
                xs={6}
              >
                <PostTypeButtonLink {...postType} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </CenterModal>
      <RoundedButton
        fullWidth
        onClick={() => setOpen(true)}
        size="large"
        variant="contained"
      >
        + {t('createNewPost')}
      </RoundedButton>
    </>
  );
};
