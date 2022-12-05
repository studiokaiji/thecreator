import EditIcon from '@mui/icons-material/EditOutlined';
import ShareIcon from '@mui/icons-material/ShareOutlined';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { useState } from 'react';

import { Edit } from './Edit';

import { CreatorDocData } from '#types/firestore/creator';
import { CenterModal } from '@/components/helpers/CenterModal';
import { RoundedButton } from '@/components/helpers/RoundedButton';

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
  const [opened, setOpened] = useState<'share' | 'edit' | null>(null);

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          justifyContent: 'end',
        }}
      >
        {minimize ? (
          <IconButton onClick={() => setOpened('share')}>
            <ShareIcon />
          </IconButton>
        ) : (
          <RoundedButton
            onClick={() => setOpened('share')}
            startIcon={<ShareIcon />}
            variant="outlined"
          >
            Share
          </RoundedButton>
        )}
        {editable &&
          (minimize ? (
            <IconButton onClick={() => setOpened('edit')}>
              <EditIcon />
            </IconButton>
          ) : (
            <RoundedButton
              onClick={() => setOpened('edit')}
              startIcon={<EditIcon />}
              variant="outlined"
            >
              Edit
            </RoundedButton>
          ))}
      </Box>
      {opened === 'share' && (
        <CenterModal onClose={() => setOpened(null)} open={opened === 'share'}>
          <div />
        </CenterModal>
      )}
      <CenterModal
        onClose={() => setOpened(null)}
        open={opened === 'edit'}
        width={640}
      >
        <Edit data={data} />
      </CenterModal>
    </>
  );
};
