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
      <CenterModal maxWidth={560} onClose={close} open={isOpen} width="100%">
        {selectedPostType === 'audio' ? (
          <AudioPost />
        ) : selectedPostType === 'images' ? (
          <ImagesPost />
        ) : (
          <CreateNewPostSelector onSelectPostType={setSelectedPostType} />
        )}
      </CenterModal>
      <RoundedButton fullWidth onClick={open} size="large" variant="contained">
        + {t('createNewPost')}
      </RoundedButton>
    </>
  );
};
