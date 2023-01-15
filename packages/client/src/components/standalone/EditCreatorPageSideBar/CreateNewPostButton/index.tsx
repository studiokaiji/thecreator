import Box from '@mui/material/Box';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AudioPost } from './AudioPost';
import { CreateNewPostSelector } from './CreateNewPostSelector';
import { ImagesPost } from './ImagesPost';

import { CenterModal } from '@/components/helpers/CenterModal';
import { RoundedButton } from '@/components/helpers/RoundedButton';

export const CreateNewPostButton = () => {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedPostType, setSelectedPostType] =
    useState<CreatorPostDocDataContentsType>();

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => {
    setSelectedPostType(undefined);
    setIsOpen(false);
  }, []);

  return (
    <>
      <CenterModal
        fullWidth={!!selectedPostType}
        maxWidth="sm"
        onClose={close}
        open={isOpen}
      >
        <Box>
          {selectedPostType === 'audio' ? (
            <AudioPost />
          ) : selectedPostType === 'images' ? (
            <ImagesPost />
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
