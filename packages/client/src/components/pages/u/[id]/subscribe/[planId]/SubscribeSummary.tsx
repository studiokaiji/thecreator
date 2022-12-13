import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import { rpcProvider } from '@/rpc-provider';
import { blockTimestampToDate } from '@/utils/block-timestamp-to-date';
import { Plan } from '@/utils/get-plans-from-chain';
import { formatWeiUnits } from '@/utils/wei-units-converter';

type SubscribeSummaryProps = {
  plan: Plan;
  onClickConfirmButton: () => void;
  expirationDuration?: number;
};

const expirationDateFetcher = async (duration: number) => {
  const num = await rpcProvider.getBlockNumber();
  const block = await rpcProvider.getBlock(num);
  const expirationTimestamp = block.timestamp + duration;
  const date = blockTimestampToDate(expirationTimestamp);
  return date;
};

export const SubscribeSummary = ({
  expirationDuration = 30 * 24 * 60 * 60,
  onClickConfirmButton,
  plan: { currency, keyPrice, name },
}: SubscribeSummaryProps) => {
  const { t } = useTranslation();

  const { data: expirationDate } = useSWR(
    [expirationDuration],
    expirationDateFetcher,
    {
      refreshInterval: 60 * 1000,
    }
  );

  const formattedPrice = formatWeiUnits(keyPrice, currency);

  return (
    <Stack spacing={2}>
      <Typography fontWeight={600}>Summary</Typography>
      <Stack direction="row" justifyContent="space-between">
        <Typography fontWeight={600}>
          {name} {t('plan')}
        </Typography>
        <Typography fontWeight={600}>
          {formattedPrice} {currency}
        </Typography>
      </Stack>
      <Divider />
      <Stack direction="row" justifyContent="space-between">
        <Typography fontWeight={600}>{t('total')}</Typography>
        <Typography fontWeight={600}>
          {formattedPrice} {currency}
        </Typography>
      </Stack>
      <Divider />
      <Stack>
        <Typography>
          Expiration Date: {expirationDate?.toLocaleString()}
        </Typography>
        <Typography variant="body2">* {t('expirationDateNote')}</Typography>
      </Stack>
      <Divider />
      <Button onClick={onClickConfirmButton} variant="contained">
        {t('confirmPayment')}
      </Button>
    </Stack>
  );
};
