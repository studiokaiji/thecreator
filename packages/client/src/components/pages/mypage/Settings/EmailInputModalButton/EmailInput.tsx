import { CircularProgress } from '@mui/material';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useSnackbar } from '@/hooks/useSnackbar';
import { useUser } from '@/hooks/useUser';

type EmailInputCardProps = {
  onClose: () => void;
  onComplete: (newEmail: string) => void;
};

const EMAIL_REGEXP = /^[\w\-._]+@[\w\-._]+\.[A-Za-z]+/;

export const EmailInput = ({ onClose, onComplete }: EmailInputCardProps) => {
  const { data, error, updateUserEmail } = useUser();

  const {
    formState: { errors, isValid },
    getValues,
    register,
  } = useForm<{ email: string }>({
    mode: 'onChange',
  });

  const { t } = useTranslation();

  const { open } = useSnackbar();

  if (error && error.length) {
    open(JSON.stringify(error, null, 2), 'error');
  }

  const [status, setStatus] = useState<'typing' | 'processing' | 'done'>(
    'typing'
  );
  const [updateError, setUpdateError] = useState('');

  const save = async () => {
    const email = getValues('email');
    if (!isValid) {
      return;
    }
    setStatus('processing');
    await updateUserEmail(email).catch((e) =>
      setUpdateError(JSON.stringify(e, null, 2))
    );
    setStatus('done');

    onComplete(email);
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5">{t('email')}</Typography>
      {data && status === 'typing' ? (
        <>
          {data?.email && (
            <Typography>
              {t('currentEmail')}: {data.email}
            </Typography>
          )}
          <TextField
            {...register('email', {
              pattern: {
                message: t('validationErrors.invalidType'),
                value: EMAIL_REGEXP,
              },
              required: {
                message: t('validationErrors.required'),
                value: true,
              },
            })}
            required
            error={!!errors.email}
            helperText={errors.email?.message}
            label={t('newEmail')}
            variant="standard"
          />
          <Button disabled={!isValid} onClick={save} variant="contained">
            {t('save')}
          </Button>
        </>
      ) : updateError ? (
        <>
          <pre>{updateError}</pre>
          <Button onClick={onClose} variant="contained">
            {t('close')}
          </Button>
        </>
      ) : status === 'done' ? (
        <>
          <Typography>{t('complete')}</Typography>
          <Typography>
            {t('confirmationEmailSentMessage', { email: getValues('email') })}
          </Typography>
          <Button onClick={onClose} variant="contained">
            {t('close')}
          </Button>
        </>
      ) : (
        <Stack mx="auto" textAlign="center" width="100%">
          <CircularProgress />
        </Stack>
      )}
    </Stack>
  );
};
