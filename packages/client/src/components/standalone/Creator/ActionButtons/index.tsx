import Box from '@mui/material/Box';

import { EditButton } from './EditButton';
import { ShareButton } from './ShareButton';

import type { CreatorDocData } from '#types/firestore/creator';

type ActionButtonsProps = {
  minimize: boolean;
  editable: boolean;
  data: CreatorDocData;
};

export const ActionButtons = ({
  data,
  editable,
  minimize,
}: ActionButtonsProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        justifyContent: 'end',
      }}
    >
      <ShareButton data={data} minimize={minimize} />
      {editable && <EditButton data={data} minimize={minimize} />}
    </Box>
  );
};
