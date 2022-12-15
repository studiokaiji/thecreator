import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { MainSpacingLayout } from '@/components/layout/MainSpacingLayout';
import { SubscribeSummary } from '@/components/pages/u/[id]/subscribe/[planId]/SubscribeSummary';
import { PlanCard } from '@/components/standalone/Creator/plans/PlanCard';
import { MainLoading } from '@/components/standalone/MainLoading';
import { useBeforeUnload } from '@/hooks/useBeforeUnload';
import { useCreatorPlan } from '@/hooks/useCreatorPlan';
import { useOnlyCurrentUser } from '@/hooks/useOnlyAuthenticated';
import { usePublicLock } from '@/hooks/usePublicLock';
import { NotFound } from '@/pages/404';

export const SubscribePage = () => {
  const { id, planId } = useParams();

  if (!id || !planId) {
    throw Error();
  }

  const { data: plan, error } = useCreatorPlan(id, planId);

  const { purchase } = usePublicLock(plan?.lockAddress);

  const { t } = useTranslation();

  const [status, setStatus] = useState<
    null | 'waitingSendTx' | 'sentApproveTx' | 'sentPurchaseTx' | 'complete'
  >(null);
  const [errorMessage, setErrorMessage] = useState('');

  useBeforeUnload((status !== null && status !== 'complete') || !!errorMessage);

  useOnlyCurrentUser();

  const confirmPayment = useCallback(async () => {
    try {
      setStatus('waitingSendTx');
      await purchase({
        onApproveTxSend: () => setStatus('sentApproveTx'),
        onPurchaseTxSend: () => setStatus('sentPurchaseTx'),
        requests: [
          {
            amount: plan?.keyPrice,
          },
        ],
        tokenAddress: plan?.tokenAddress,
      });
      setStatus('complete');
    } catch (e) {
      setErrorMessage(JSON.stringify(e));
      console.error(e);
    }
  }, [plan]);

  const navigate = useNavigate();

  useEffect(() => {
    if (status === 'complete') {
      navigate(`/c/${id}`);
    }
  }, [status]);

  if (!plan && !error) {
    return <MainLoading />;
  }

  if (error === 'Error: Creator data does not exist' || !plan) {
    return <NotFound />;
  }

  if (status === 'complete') {
    return <div />;
  }

  return (
    <MainSpacingLayout>
      <Stack
        gap={6}
        sx={(theme) => ({
          [theme.breakpoints.up('md')]: {
            maxWidth: 860,
          },
          maxWidth: 400,
          mx: 'auto',
          width: '100%',
        })}
      >
        <Typography variant="h1">Subscribe</Typography>
        <Grid container alignItems="stretch" spacing={3}>
          <Grid item md={5} xs={12}>
            <PlanCard hiddenButton plan={plan} />
          </Grid>
          <Grid item md={7} xs={12}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                {status === null ? (
                  <SubscribeSummary
                    onClickConfirmButton={confirmPayment}
                    plan={plan}
                  />
                ) : (
                  <Stack alignItems="center" spacing={2} textAlign="center">
                    {error ? (
                      <Typography component="pre" textAlign="left">
                        {error}
                      </Typography>
                    ) : (
                      <>
                        <CircularProgress />
                        <Typography>{t(status)}</Typography>
                      </>
                    )}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </MainSpacingLayout>
  );
};
