import EditIcon from '@mui/icons-material/EditOutlined';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { CreatorDocData } from '#types/firestore/creator';
import { Status } from '#types/status';
import { CenterModal } from '@/components/helpers/CenterModal';
import { RoundedButton } from '@/components/helpers/RoundedButton';
import { getCreatorDocRef } from '@/converters/creatorConverter';
import { useSnackbar } from '@/hooks/useSnackbar';

type EditButtonProps = {
  data: CreatorDocData;
  minimize: boolean;
  onChangeData: (data: CreatorDocData) => void;
};

type EditableCreatorDocDataInputs = {
  creatorName: string;
  description: string;
};

export const EditButton = ({
  data,
  minimize,
  onChangeData,
}: EditButtonProps) => {
  const { getValues, register } = useForm<EditableCreatorDocDataInputs>();

  const [status, setStatus] = useState<Status>('typing');

  const { open: openSnackbar } = useSnackbar();

  const onClickSaveButtonHandler = async () => {
    try {
      setStatus('processing');
      const { creatorName, description } = getValues();
      const docRef = getCreatorDocRef(data.id);
      onChangeData({ ...data, creatorName, description });
      await updateDoc(docRef, { creatorName, description });
      openSnackbar(t('saveSuccessed'));
      close();
    } catch (e) {
      console.error(e);
      setStatus('failed');
    }
  };

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
        <Stack component="form" spacing={1.5}>
          <Typography variant="h5">{t('edit')}</Typography>
          <TextField
            {...register('creatorName')}
            defaultValue={data.creatorName}
            label={t('creatorName')}
            variant="standard"
          />
          <TextField
            {...register('description')}
            multiline
            defaultValue={data.description}
            label={t('description')}
            rows={3}
            variant="standard"
          />
          <Button onClick={onClickSaveButtonHandler} variant="contained">
            {t('save')}
          </Button>
          {status === 'failed' && (
            <Typography color={'red'}>{t('failed')}</Typography>
          )}
        </Stack>
      </CenterModal>
    </>
  );
};
