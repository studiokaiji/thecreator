import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';

import { MinimalLink } from '@/components/helpers/MinimalLink';

const height = 150;

type AudioPostCardProps = {
  coverImage: {
    src: string;
    alt?: string;
  };
  audioSrc: string;
  contentTitle: string;
  to: string;
};

export const AudioPostCard = ({
  audioSrc,
  contentTitle,
  coverImage,
  to,
}: AudioPostCardProps) => (
  <MinimalLink to={to}>
    <Card sx={{ display: 'flex', height }}>
      <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
        <CardContent sx={{ flex: '1 0 auto', textAlign: 'left' }}>
          <Typography variant="h6">{contentTitle}</Typography>
          <CardMedia controls component="audio" src={audioSrc} sx={{ mt: 2 }} />
        </CardContent>
      </Box>
      <CardMedia
        alt={coverImage.alt}
        component="img"
        image={coverImage.src}
        sx={{ height, objectFit: 'cover', width: height }}
      />
    </Card>
  </MinimalLink>
);
