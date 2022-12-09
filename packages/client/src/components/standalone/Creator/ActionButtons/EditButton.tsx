import EditIcon from '@mui/icons-material/EditOutlined';
import IconButton from '@mui/material/IconButton';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CreatorDocData } from '#types/firestore/creator';
import { CenterModal } from '@/components/helpers/CenterModal';
import { RoundedButton } from '@/components/helpers/RoundedButton';
import { CreatorProfileEditForm } from '@/components/standalone/CreatorProfileEditForm';

type EditButtonProps = {
  data: CreatorDocData;
  minimize: boolean;
  onChangeData: (data: CreatorDocData) => void;
};

export const EditButton = ({
  data,
  minimize,
  onChangeData,
}: EditButtonProps) => {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return (
    <>
      {minimize ? (
        <IconButton onClick={open}>
          <EditIcon />
        </IconButton>
      ) : (
        <RoundedButton
          onClick={open}
          startIcon={<EditIcon />}
          variant="outlined"
        >
          {t('edit')}
        </RoundedButton>
      )}
      <CenterModal onClose={close} open={isOpen} width={minimize ? 380 : 560}>
        <CreatorProfileEditForm
          isEditSection
          data={data}
          onChangeData={onChangeData}
          onEnd={close}
        />
      </CenterModal>
    </>
  );
};
