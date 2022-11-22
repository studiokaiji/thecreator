import { TheCreatorProductFactory__factory } from '@contracts';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { MainSpacingLayout } from '@/components/layout/MainSpacingLayout';
import { MainLoading } from '@/components/standalone/MainLoading';
import { getCreatorDocRef } from '@/converters/creators';
import { useCreator } from '@/hooks/useCreator';
import { useOnlyValidNetwork } from '@/hooks/useOnlyValidNetwork';
import { useWallet } from '@/hooks/useWallet';

type ReceiveToken = 'weth' | 'usdc';

type CreatePageInputs = {
  creatorName: string;
  receiveToken: ReceiveToken;
};

const tokenAddresses: { [token in ReceiveToken]: string } = {
  usdc: import.meta.env.VITE_USDC_ADDRESS,
  weth: import.meta.env.VITE_WETH_ADDRESS,
};

export const CreatePage = () => {
  const { getValues, register } = useForm<CreatePageInputs>();

  const [txHash, setTxHash] = useState('');
  const [status, setStatus] = useState<
    'typing' | 'waitingSendTx' | 'deploying' | 'deployed' | 'failedToSendTx'
  >('typing');
  const [contractAddress, setContractAddress] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { account, library, switchChain } = useWallet();

  const { data, error } = useCreator();

  const [loading, setLoading] = useState(true);

  useOnlyValidNetwork();

  const onClickCreatePageButtonHandler = () => {
    if (!library || !account) return;

    const { creatorName, receiveToken } = getValues();

    (async () => {
      setStatus('waitingSendTx');

      await switchChain();

      const factoryContract = TheCreatorProductFactory__factory.connect(
        import.meta.env.VITE_PRODUCT_FACTORY_CONTRACT_ADDRESS,
        library.getSigner()
      );

      const txRes = await factoryContract.create(
        creatorName,
        'SYMBOL',
        tokenAddresses[receiveToken]
      );
      setStatus('deploying');
      setTxHash(txRes.hash);

      const txReceipt = await txRes.wait();

      setStatus('deployed');

      const event = txReceipt.events?.filter(
        ({ event }) => event === 'Deployed'
      )[0];
      if (!event || !event.args) throw Error('Invalid event');

      const contractAddress = event.args.product;
      setContractAddress(contractAddress);

      const docRef = getCreatorDocRef(contractAddress);

      await setDoc(docRef, {
        creatorAddress: account,
        creatorName,
        description: '',
        id: '',
        pinningPostId: '',
        updatedAt: new Date(),
      }).catch(console.error);
    })().catch((e) => {
      console.log(e);
      if (e.code === 'ACTION_REJECTED') {
        back();
        return;
      }
      setStatus('failedToSendTx');
      setErrorMessage(JSON.stringify(e, null, 2));
    });
  };

  const { t } = useTranslation();

  const back = () => {
    setStatus('typing');
    setTxHash('');
    setContractAddress('');
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
              <Stack component="form" spacing={2}>
                <TextField
                  {...register('creatorName')}
                  label={t('creatorName')}
                  sx={{ width: '100%' }}
                  variant="standard"
                />
                <FormControl sx={{ width: '100%' }} variant="standard">
                  <InputLabel>{t('receiveToken')}</InputLabel>
                  <Select {...register('receiveToken')} defaultValue="usdc">
                    <MenuItem value="weth">ETH(WETH)</MenuItem>
                    <MenuItem value="usdc">USDC</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  onClick={onClickCreatePageButtonHandler}
                  variant="contained"
                >
                  {t('create')}
                </Button>
              </Stack>
            ) : (
              <Stack spacing={3} sx={{ textAlign: 'center' }}>
                <Typography>{t(status)}</Typography>
                {contractAddress && status === 'deployed' ? (
                  <>
                    <Typography>Contract Address: {contractAddress}</Typography>
                    <Link href="/edit/profile">{t('goToCreatorConsole')}</Link>
                  </>
                ) : (
                  txHash && (
                    <Typography variant="body2">
                      Transaction Hash: {txHash}
                    </Typography>
                  )
                )}
                {errorMessage && (
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
