import LoadingButton from '@mui/lab/LoadingButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { ReactNode, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { PictureUploader } from './PictureUploader';

import { useCreatorForWrite } from '@/hooks/useCreatorForWrite';
import { UseImageData } from '@/hooks/useImage';
import { useSnackbar } from '@/hooks/useSnackbar';

type EditableCreatorDocDataInputs = {
  creatorName: string;
  description: string;
};

type CreatorProfileEditFormProps = {
  data?: WithId<CreatorDocData>;
  onChangeData?: (data: WithId<CreatorDocData>) => void;
  onError?: (e: any) => void;
  onEnd: () => void;
  saveButtonChild: ReactNode;
};

export const CreatorProfileEditForm = ({
  data,
  onChangeData,
  onEnd,
  onError,
  saveButtonChild,
}: CreatorProfileEditFormProps) => {
  const {
    formState: { errors, isValid },
    getValues,
    register,
  } = useForm<EditableCreatorDocDataInputs>({
    defaultValues: data,
    mode: 'onChange',
  });

  const [status, setStatus] = useState<'typing' | 'processing' | 'failed'>(
    'typing'
  );

  const { open: openSnackbar } = useSnackbar();

  const { addCreator, updateCreator } = useCreatorForWrite();

  const [iconImage, setIconImage] = useState<UseImageData>();
  const [headerImage, setHeaderImage] = useState<UseImageData>();

  const onClickSaveButtonHandler = async () => {
    try {
      setStatus('processing');
      const { creatorName, description } = getValues();

      const images = { header: headerImage, icon: iconImage };

      if (data) {
        const updated = await updateCreator(
          { creatorName, description },
          images
        );
        onChangeData &&
          onChangeData({
            ...data,
            creatorName: creatorName || data.creatorName,
            description: description || data.description,
            headerImageSrc: updated.headerImageSrc || data.headerImageSrc,
            iconImageSrc: updated.iconImageSrc || data.iconImageSrc,
          });
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
    <Stack component="form" spacing={3}>
      <PictureUploader
        onChangeHeader={setHeaderImage}
        onChangeIcon={setIconImage}
        {...data}
      />
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
      <LoadingButton
        disabled={!isValid}
        loading={status === 'processing'}
        onClick={onClickSaveButtonHandler}
        variant="contained"
      >
        {saveButtonChild}
      </LoadingButton>
      {status === 'failed' && (
        <Typography color={'red'}>{t('failed')}</Typography>
      )}
    </Stack>
  );
};
