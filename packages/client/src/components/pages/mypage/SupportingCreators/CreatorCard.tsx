import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { MinimalLink } from '@/components/helpers/MinimalLink';

type CreatorCardProps = {
  creatorId: string;
  creatorName: string;
  icon?: {
    src?: string;
    alt?: string;
  };
};

export const CreatorCard = ({
  creatorId,
  creatorName,
  icon,
}: CreatorCardProps) => {
  return (
    <MinimalLink to={`/c/${creatorId}`}>
      <Stack direction="row" gap={2}>
        <Box>
          <Avatar {...icon} />
        </Box>
        <Box overflow="hidden" width="100%">
          <Typography overflow="hidden" textOverflow="ellipsis">
            {creatorName}
          </Typography>
          <Typography
            color="GrayText"
            display="block"
            overflow="hidden"
            textOverflow="ellipsis"
            variant="caption"
          >
            {creatorId}
          </Typography>
        </Box>
      </Stack>
    </MinimalLink>
  );
};
