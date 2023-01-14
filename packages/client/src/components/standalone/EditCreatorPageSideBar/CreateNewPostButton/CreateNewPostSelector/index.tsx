import FormatColorTextIcon from '@mui/icons-material/FormatColorTextOutlined';
import HeadphonesIcon from '@mui/icons-material/HeadphonesOutlined';
import InsertPhotoIcon from '@mui/icons-material/InsertPhotoOutlined';
import VideoLibraryIcon from '@mui/icons-material/VideoLibraryOutlined';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTranslation } from 'react-i18next';

import {
  PostTypeButtonLink,
  PostTypeButtonLinkProps,
} from './PostTypeButtonLink';

type CreateNewPostSelectorProps = {
  onSelectPostType: (postType: CreatorPostDocDataContentsType) => void;
};

export const CreateNewPostSelector = ({
  onSelectPostType,
}: CreateNewPostSelectorProps) => {
  const { t } = useTranslation();

  const theme = useTheme();
  const isOverSm = useMediaQuery(theme.breakpoints.up('sm'));

  const postTypes: PostTypeButtonLinkProps[] = [
    {
      icon: <FormatColorTextIcon />,
      onClick: async () => {
        onSelectPostType('text');
      },
      text: t('text'),
    },
    {
      icon: <InsertPhotoIcon />,
      onClick: async () => {
        onSelectPostType('images');
      },
      text: t('image'),
    },
    {
      icon: <VideoLibraryIcon />,
      onClick: () => null,
      text: t('video'),
    },
    {
      icon: <HeadphonesIcon />,
      onClick: async () => {
        onSelectPostType('audio');
      },
      text: t('audio'),
    },
  ];

  return (
    <Box width="100%">
      <Typography sx={{ lineHeight: 1 }} variant="h5">
        {t('createNewPost')}
      </Typography>
      <Typography color="GrayText" fontWeight={600} sx={{ mt: 3 }}>
        {t('postType')}
      </Typography>
      <Grid container sx={{ mt: 1, width: isOverSm ? 440 : '100%' }}>
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
  );
};
