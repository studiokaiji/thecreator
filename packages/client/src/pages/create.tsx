import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { MainSpacingLayout } from '@/components/layout/MainSpacingLayout';
import { CreatorProfileEditForm } from '@/components/standalone/CreatorProfileEditForm';
import { MainLoading } from '@/components/standalone/MainLoading';
import { useCreator } from '@/hooks/useCreator';
import { useWallet } from '@/hooks/useWallet';

export const CreatePage = () => {
  const [typing, setTyping] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const { account } = useWallet();

  const { data, error } = useCreator({ creatorAddress: account });

  const [loading, setLoading] = useState(true);

  const { t } = useTranslation();

  const back = () => {
    setTyping(false);
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
            {typing ? (
              <CreatorProfileEditForm
                onEnd={() => setTyping(false)}
                onError={(e) => setErrorMessage(JSON.stringify(e, null, 2))}
              />
            ) : (
              <Stack spacing={3} sx={{ textAlign: 'center' }}>
                {errorMessage ? (
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
                ) : (
                  <>
                    <Typography variant="h6">{t('success')}</Typography>
                    <Link href="/edit/profile">{t('goToCreatorConsole')}</Link>
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
