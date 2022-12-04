import EditIcon from '@mui/icons-material/EditOutlined';
import ShareIcon from '@mui/icons-material/ShareOutlined';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';

import { RoundedButton } from '@/components/helpers/RoundedButton';

type ActionButtonsProps = {
  minimize: boolean;
  editable: boolean;
};

export const ActionButtons = ({ editable, minimize }: ActionButtonsProps) => (
  <Box
    sx={{
      display: 'flex',
      gap: 2,
      justifyContent: 'end',
    }}
  >
    {minimize ? (
      <IconButton>
        <ShareIcon />
      </IconButton>
    ) : (
      <RoundedButton startIcon={<ShareIcon />} variant="outlined">
        Share
      </RoundedButton>
    )}
    {editable &&
      (minimize ? (
        <IconButton>
          <EditIcon />
        </IconButton>
      ) : (
        <RoundedButton startIcon={<EditIcon />} variant="outlined">
          Edit
        </RoundedButton>
      ))}
  </Box>
);
