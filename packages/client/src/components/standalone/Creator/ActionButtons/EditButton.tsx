import EditIcon from '@mui/icons-material/EditOutlined';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CenterModal } from '@/components/helpers/CenterModal';
import { RoundedButton } from '@/components/helpers/RoundedButton';
import { CreatorProfileEditForm } from '@/components/standalone/CreatorProfileEditForm';

type EditButtonProps = {
  data: WithId<CreatorDocData>;
  minimize: boolean;
  onChangeData: (data: WithId<CreatorDocData>) => void;
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
      <CenterModal fullWidth maxWidth="sm" onClose={close} open={isOpen}>
        <Stack spacing={2}>
          <Typography variant="h5">{t('edit')}</Typography>
          <CreatorProfileEditForm
            data={data}
            onChangeData={onChangeData}
            onEnd={close}
            saveButtonChild={t('save')}
          />
        </Stack>
      </CenterModal>
    </>
  );
};
