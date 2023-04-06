import Box from '@mui/material/Box';

import { EditButton } from './EditButton';
import { ShareButton } from './ShareButton';

type ActionButtonsProps = {
  minimize: boolean;
  editable: boolean;
  data: WithId<CreatorDocData>;
  onChangeData: (data: WithId<CreatorDocData>) => void;
};

export const ActionButtons = ({
  data,
  editable,
  minimize,
  onChangeData,
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
      {editable && (
        <EditButton
          data={data}
          minimize={minimize}
          onChangeData={onChangeData}
        />
      )}
    </Box>
  );
};
