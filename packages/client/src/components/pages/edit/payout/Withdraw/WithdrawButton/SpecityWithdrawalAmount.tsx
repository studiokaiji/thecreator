import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type SpecityWithdrawalAmountProps = {
  onClickNextButton: (ethBalance: number) => void;
  ethBalance: number;
  currency: string;
  planName: string;
};

export const SpecityWithdrawalAmount = ({
  currency,
  ethBalance,
  onClickNextButton,
  planName,
}: SpecityWithdrawalAmountProps) => {
  const {
    formState: { errors },
    getValues,
    register,
  } = useForm({
    defaultValues: {
      withdrawalAmount: ethBalance * 0.9,
    },
    mode: 'onChange',
  });

  const { t } = useTranslation();

  const onClickNextButtonHandler = () => {
    const { withdrawalAmount } = getValues();
    onClickNextButton(withdrawalAmount);
  };

  return (
    <Stack spacing={6}>
      <Box>
        <Box>
          <Typography fontWeight={500}>{t('status')}</Typography>
          <Typography>
            {t('plan')}: {planName}
          </Typography>
          <Typography>
            {t('available')}: {ethBalance} {currency}
          </Typography>
        </Box>
        <Box mt={3}>
          <TextField
            required
            {...register('withdrawalAmount', {
              max: {
                message: t('validationErrors.mustBeValOrLess', {
                  val: ethBalance,
                }),
                value: ethBalance,
              },
              min: {
                message: t('validationErrors.mustBePositive', {
                  val: ethBalance,
                }),
                value: 10e-18,
              },
              required: t('validationErrors.required'),
            })}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">{currency}</InputAdornment>
              ),
            }}
            error={!!errors.withdrawalAmount}
            helperText={errors.withdrawalAmount?.message}
            label={t('Withdrawal amount')}
            type="number"
            variant="standard"
          />
          <Typography mt={1} variant="subtitle2">
            {t('guideLineMessageForRefund')}
          </Typography>
        </Box>
      </Box>
      <Button onClick={onClickNextButtonHandler} variant="contained">
        {t('next')}
      </Button>
    </Stack>
  );
};
