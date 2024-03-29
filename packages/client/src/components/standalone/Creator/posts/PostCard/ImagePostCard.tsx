import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';

import { CreatedAtTypography } from './common/CreateAtTypography';
import { TitleTypography } from './common/TitleTypography';

import { PostCardPropsBase } from '.';

import { MinimalLink } from '@/components/helpers/MinimalLink';

export const ImagePostCard = ({
  contents,
  createdAt,
  title,
  to,
}: PostCardPropsBase) => {
  return (
    <Card>
      <CardMedia
        component={'img'}
        src={contents[0]?.url}
        sx={{ height: 'auto', width: '100%' }}
      />
      <CardContent sx={{ textAlign: 'left' }}>
        <MinimalLink to={to}>
          <TitleTypography title={title} />
          <CreatedAtTypography createdAt={createdAt} />
        </MinimalLink>
      </CardContent>
    </Card>
  );
};
