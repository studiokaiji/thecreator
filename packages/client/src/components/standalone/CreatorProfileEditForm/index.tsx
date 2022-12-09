import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { CreatorDocData } from '#types/firestore/creator';
import { Status } from '#types/status';
import { useCreatorForWrite } from '@/hooks/useCreatorForWrite';
import { useSnackbar } from '@/hooks/useSnackbar';

type EditableCreatorDocDataInputs = {
  creatorName: string;
  description: string;
};

type CreatorProfileEditFormProps = {
  data?: CreatorDocData;
  onChangeData?: (data: CreatorDocData) => void;
  onError?: (e: any) => void;
  onEnd: () => void;
  isEditSection: boolean;
};

export const CreatorProfileEditForm = ({
  data,
  isEditSection,
  onChangeData,
  onEnd,
  onError,
}: CreatorProfileEditFormProps) => {
  const {
    formState: { errors, isValid },
    getValues,
    register,
  } = useForm<EditableCreatorDocDataInputs>({
    defaultValues: data,
    mode: 'onChange',
  });

  const [status, setStatus] = useState<Status>('typing');

  const { open: openSnackbar } = useSnackbar();

  const { addCreator, updateCreator } = useCreatorForWrite();

  const onClickSaveButtonHandler = async () => {
    try {
      setStatus('processing');
      const { creatorName, description } = getValues();

      if (data) {
        onChangeData && onChangeData({ ...data, creatorName, description });
        await updateCreator(creatorName, description);
      } else {
        await addCreator(creatorName, description);
      }

      openSnackbar(t('saveSuccessed'));
      onEnd();
    } catch (e) {
      console.error(e);
      onError && onError(e);
      setStatus('failed');
    }
  };

  const { t } = useTranslation();

  return (
    <Stack component="form" spacing={1.5}>
      {isEditSection && <Typography variant="h5">{t('edit')}</Typography>}
      <TextField
        {...register('creatorName', {
          maxLength: {
            message: t('validationErrors.maxLength', { maxLength: 40 }),
            value: 40,
          },
          required: t('validationErrors.required'),
        })}
        required
        error={!!errors.creatorName}
        helperText={errors.creatorName?.message}
        label={t('creatorName')}
        variant="standard"
      />
      <TextField
        {...register('description', {
          maxLength: {
            message: t('validationErrors.maxLength', { maxLength: 1000 }),
            value: 1000,
          },
        })}
        multiline
        label={t('description')}
        rows={4}
        variant="standard"
      />
      <Button
        disabled={!isValid}
        onClick={onClickSaveButtonHandler}
        variant="contained"
      >
        {isEditSection ? t('save') : t('add')}
      </Button>
      {status === 'failed' && (
        <Typography color={'red'}>{t('failed')}</Typography>
      )}
    </Stack>
  );
};
