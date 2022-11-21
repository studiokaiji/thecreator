import { TheCreatorProductFactory__factory } from '@contracts';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { getCreatorDocRef } from '@/converters/creators';
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

  const { account, library } = useWallet();

  const onClickCreatePageButtonHandler = () => {
    if (!library || !account) return;

    const { creatorName, receiveToken } = getValues();

    (async () => {
      setStatus('waitingSendTx');

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
      }).catch((e) => console.error(e));
    })().catch((e) => {
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

  return (
    <Box sx={{ m: 'auto' }}>
      <Typography align="center" variant="h3">
        {t('becomeACreator')}
      </Typography>
      {status === 'typing' ? (
        <form>
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
          <Button onClick={onClickCreatePageButtonHandler} variant="contained">
            {t('create')}
          </Button>
        </form>
      ) : (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6">{t(status)}</Typography>
          {txHash && <Typography>Transaction Hash: {txHash}</Typography>}
          {contractAddress && status === 'deployed' && (
            <>
              <Typography>Contract Address: {contractAddress}</Typography>
              <Link to="/edit">{t('goToCreatorConsole')}</Link>
            </>
          )}
          {errorMessage && (
            <>
              <Typography color="red">{errorMessage}</Typography>
              <Button onClick={back} variant="contained">
                {t('backToInput')}
              </Button>
            </>
          )}
        </Box>
      )}
    </Box>
  );
};
