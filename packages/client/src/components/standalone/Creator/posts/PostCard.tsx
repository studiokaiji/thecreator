import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';

import { MinimalLink } from '@/components/helpers/MinimalLink';

type PostCardProps = {
  media: {
    type: 'img' | 'video';
    src: string;
    alt?: string;
  };
  content: {
    title: string;
    text: string;
  };
  to: string;
};

export const PostCard = ({ content, media, to }: PostCardProps) => {
  return (
    <MinimalLink to={to}>
      <Card>
        <CardMedia
          controls
          alt={media.alt}
          component={media.type}
          src={media.src}
          sx={{ height: 'auto', width: '100%' }}
        />
        <CardContent sx={{ textAlign: 'left' }}>
          <Typography gutterBottom variant="h6">
            {content.title}
          </Typography>
          <Typography color="GrayText" variant="body2">
            {content.text}
          </Typography>
        </CardContent>
      </Card>
    </MinimalLink>
  );
};
