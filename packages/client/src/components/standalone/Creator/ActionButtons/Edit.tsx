import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { CreatorDocData } from '#types/firestore/creator';
import { Status } from '#types/status';
import { getCreatorDocRef } from '@/converters/creatorConverter';

type EditModalProps = {
  data: CreatorDocData;
};

type EditableCreatorDocDataInputs = {
  creatorName: string;
  description: string;
};

export const Edit = ({ data }: EditModalProps) => {
  const { getValues, register } = useForm<EditableCreatorDocDataInputs>();

  const [status, setStatus] = useState<Status>('typing');

  const onClickSaveButtonHandler = async () => {
    try {
      setStatus('processing');
      const { creatorName, description } = getValues();
      const docRef = getCreatorDocRef(data.id);
      await updateDoc(docRef, { creatorName, description });
    } catch (e) {
      console.error(e);
      setStatus('failed');
    }
  };

  const { t } = useTranslation();

  return (
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
  );
};
