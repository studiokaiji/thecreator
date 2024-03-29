import Box from '@mui/material/Box';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';

import { AudioPost } from './AudioPost';
import { CreateNewPostSelector } from './CreateNewPostSelector';
import { ImagesPost } from './ImagesPost';
import { VideoPost } from './VideoPost';

import { CenterModal } from '@/components/helpers/CenterModal';
import { RoundedButton } from '@/components/helpers/RoundedButton';
import { useSnackbar } from '@/hooks/useSnackbar';

export const CreateNewPostButton = () => {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedPostType, setSelectedPostType] =
    useState<CreatorPostDocDataContentsType>();

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const { open: openSnackbar } = useSnackbar();
  const done = () => {
    close();
    openSnackbar(t('successfullyPosted'));
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedPostType(undefined);
    }
  }, [isOpen]);

  const onRequestClose = () => {
    if (selectedPostType) {
      const isConfirmed = confirm(t('requestCloseConfirmMessage'));
      if (!isConfirmed) return;
    }
    close();
  };

  return (
    <>
      <CenterModal
        fullWidth={!!selectedPostType}
        maxWidth="sm"
        onClose={onRequestClose}
        open={isOpen}
      >
        <Box>
          {selectedPostType === 'text' ? (
            <Box onClick={close}>
              <Navigate to="/edit/post/text" />
            </Box>
          ) : selectedPostType === 'audio' ? (
            <AudioPost onDone={done} />
          ) : selectedPostType === 'images' ? (
            <ImagesPost onDone={done} />
          ) : selectedPostType === 'video' ? (
            <VideoPost onDone={done} />
          ) : (
            <CreateNewPostSelector onSelectPostType={setSelectedPostType} />
          )}
        </Box>
      </CenterModal>
      <RoundedButton fullWidth onClick={open} size="large" variant="contained">
        + {t('createNewPost')}
      </RoundedButton>
    </>
  );
};
