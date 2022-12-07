import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { Status } from '#types/status';
import { MainSpacingLayout } from '@/components/layout/MainSpacingLayout';
import { MainLoading } from '@/components/standalone/MainLoading';
import { useCreator } from '@/hooks/useCreator';
import { useCreatorForWrite } from '@/hooks/useCreatorForWrite';
import { useOnlyValidNetwork } from '@/hooks/useOnlyValidNetwork';
import { useWallet } from '@/hooks/useWallet';

type CreatePageInputs = {
  creatorName: string;
  description: string;
};

export const CreatePage = () => {
  const { getValues, register } = useForm<CreatePageInputs>();

  const [status, setStatus] = useState<Status>('typing');
  const [errorMessage, setErrorMessage] = useState('');

  const { account } = useWallet();

  const { data, error } = useCreator({ creatorAddress: account });

  const [loading, setLoading] = useState(true);

  const { t } = useTranslation();

  useOnlyValidNetwork();

  const { addCreator } = useCreatorForWrite();

  const onClickCreatePageButtonHandler = async () => {
    if (!account) return;

    const { creatorName, description } = getValues();

    try {
      await addCreator(creatorName, description);
      setStatus('success');
    } catch (e) {
      console.error(e);
      setStatus('failed');
      setErrorMessage(String(e));
    }
  };

  const back = () => {
    setStatus('typing');
    setErrorMessage('');
  };

  useEffect(() => {
    if (!data && !error) {
      setLoading(true);
      return;
    }
    if (!data) {
      setLoading(false);
      return;
    }
  }, [data, error]);

  if (loading) {
    return <MainLoading />;
  }

  return (
    <Box sx={{ m: 'auto' }}>
      <MainSpacingLayout>
        <Paper sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
          <Typography align="center" sx={{ lineHeight: 1 }} variant="h4">
            {t('becomeACreator')}
          </Typography>
          <Box sx={{ mt: 2 }}>
            {status === 'typing' ? (
              <Stack component="form" spacing={1.5}>
                <TextField
                  {...register('creatorName')}
                  label={t('creatorName')}
                  variant="standard"
                />
                <TextField
                  {...register('description')}
                  multiline
                  label={t('description')}
                  rows={3}
                  variant="standard"
                />
                <Button
                  onClick={onClickCreatePageButtonHandler}
                  variant="contained"
                >
                  {t('create')}
                </Button>
              </Stack>
            ) : (
              <Stack spacing={3} sx={{ textAlign: 'center' }}>
                {status === 'success' ? (
                  <>
                    <Typography variant="h6">{t('success')}</Typography>
                    <Link href="/edit/profile">{t('goToCreatorConsole')}</Link>
                  </>
                ) : (
                  <>
                    <Typography
                      color="red"
                      component="pre"
                      sx={{ textAlign: 'left' }}
                    >
                      {errorMessage}
                    </Typography>
                    <Button onClick={back} variant="contained">
                      {t('backToInput')}
                    </Button>
                  </>
                )}
              </Stack>
            )}
          </Box>
        </Paper>
      </MainSpacingLayout>
    </Box>
  );
};
