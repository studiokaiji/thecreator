import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { BigNumberish, utils } from 'ethers';
import { useCallback, useState } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AddPlanActionFormFeatureTextField } from './AddPlanActionFormFeatureTextField';

import { currencies, currencyDecimals } from '@/constants';
import { useCreatorPlanForWrite } from '@/hooks/useCreatorPlanForWrite';
import { Plan } from '@/utils/get-plans-from-chain';

export type AddPlanActionFormValues = {
  currency: typeof currencies[number];
  priceEthPerMonth: number;
  name: string;
  description: string;
  features: Feature[];
  maxNumberOfMembers: BigNumberish;
};

type Feature = {
  feature: string;
};

type AddPlanActionFormProps = {
  onAdded: (data: Plan) => void;
  onClose?: () => void;
};

const pricePlaceholders: { [key in typeof currencies[number]]: string } = {
  MATIC: '10',
  USDC: '10',
  WETH: '0.01',
};

export const AddPlanActionForm = ({
  onAdded,
  onClose,
}: AddPlanActionFormProps) => {
  const {
    control,
    formState: { errors, isValid },
    getValues,
    register,
    reset,
  } = useForm<AddPlanActionFormValues>({
    defaultValues: { currency: 'USDC', features: [{ feature: '' }] },
    mode: 'onChange',
  });

  const selectedCurrency = useWatch({
    control,
    name: 'currency',
  });

  const { append, fields, remove } = useFieldArray({
    control,
    name: 'features',
  });

  const addFeatureTextField = useCallback(() => {
    append({ feature: '' });
  }, []);

  const { t } = useTranslation();

  const steps = [
    t('enterThePlanInfo'),
    t('sendingTx'),
    t('waitingConfirmation'),
    t('complete'),
  ];

  const [errorMessage, setErrorMessage] = useState('');
  const [activeStep, setActiveStep] = useState(0);

  const { addPlan } = useCreatorPlanForWrite();

  const onClickAddNewPlanHandler = async () => {
    try {
      setActiveStep(1);

      const { currency, description, features, name, priceEthPerMonth } =
        getValues();

      const keyPrice = utils.parseUnits(
        priceEthPerMonth.toString(),
        currencyDecimals[currency]
      );

      const data = {
        currency,
        description,
        features: features
          .filter(({ feature }) => feature)
          .map(({ feature }) => feature),
        keyPrice,
        lockAddress: '',
        name,
      };

      const { data: plan } = await addPlan(data, {
        onCreateLockEnded: () => setActiveStep(3),
        onCreateLockTxSend: () => setActiveStep(2),
        onFailedToTxSend: (e) => setErrorMessage(JSON.stringify(e, null, 2)),
        onUserRejected: () => setErrorMessage(t('userRejectedRequest')),
      });

      setActiveStep(4);

      reset();

      onAdded({
        ...plan,
        currency,
        keyPrice,
        ok: true,
      });
    } catch (e) {
      setErrorMessage(JSON.stringify(e, null, 2));
      console.error(e);
    }
  };

  const valT = (key: string, opts?: any) => t(`validationErrors.${key}`, opts);

  return (
    <Stack spacing={5}>
      <Typography variant="h4">{t('addNewPlan')}</Typography>
      <Stepper
        alternativeLabel
        activeStep={activeStep}
        sx={{ textAlign: 'center' }}
      >
        {steps.map((step, i) => (
          <Step key={`step-${i}`}>
            <StepLabel>{step}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 ? (
        <Stack component="form" spacing={5}>
          <Stack spacing={1.5}>
            <TextField
              {...register('name', {
                maxLength: {
                  message: valT('maxLength', { maxLength: '80' }),
                  value: 80,
                },
                required: valT('required'),
              })}
              required
              error={!!errors.name}
              helperText={errors.name?.message}
              label={t('name')}
              variant="standard"
            />
            <TextField
              {...register('description', {
                maxLength: {
                  message: valT('maxLength', { maxLength: '80' }),
                  value: 80,
                },
              })}
              error={!!errors.description}
              helperText={errors.description?.message}
              label={t('description')}
              variant="standard"
            />
          </Stack>

          <Stack spacing={1.5}>
            <Divider>{t('price')}</Divider>
            <Controller
              control={control}
              name="currency"
              render={({ field }) => (
                <TextField
                  {...field}
                  required
                  select
                  label={t('currency')}
                  variant="standard"
                >
                  {currencies.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <TextField
              required
              {...register('priceEthPerMonth', {
                min: {
                  message: valT('mustBePositive'),
                  value: 10e-18,
                },
                required: valT('required'),
              })}
              error={!!errors.priceEthPerMonth}
              helperText={errors.priceEthPerMonth?.message}
              label={t('pricePerMonth')}
              placeholder={`${t('ex')}: ${pricePlaceholders[selectedCurrency]}`}
              type="number"
              variant="standard"
            />
          </Stack>

          <Stack spacing={1.5}>
            <Divider>{t('limit')}</Divider>
            <TextField
              {...register('maxNumberOfMembers', {
                min: {
                  message: valT('mustBeValOrGreater', { val: '0' }),
                  value: 0,
                },
              })}
              error={!!errors.maxNumberOfMembers}
              helperText={errors.maxNumberOfMembers?.message}
              label={t('maxNumberOfMembers')}
              placeholder={`${t('ex')}: 100`}
              type="number"
              variant="standard"
            />
          </Stack>

          <Stack spacing={1.5}>
            <Divider>{t('features')}</Divider>
            <Stack spacing={1}>
              {fields.map((field, i) => (
                <AddPlanActionFormFeatureTextField
                  key={field.id}
                  errorMessage={errors.features && errors.features[i]?.message}
                  index={i}
                  onRemove={() => remove(i)}
                  register={register}
                />
              ))}
            </Stack>
            <Box>
              <Button
                onClick={addFeatureTextField}
                size="small"
                sx={{ border: '1px dotted' }}
              >
                + {t('add')}
              </Button>
            </Box>
          </Stack>

          <Button
            disabled={!isValid}
            onClick={onClickAddNewPlanHandler}
            variant="contained"
          >
            {t('addNewPlan')}
          </Button>
        </Stack>
      ) : (
        <Stack spacing={0.5} sx={{ display: 'block', textAlign: 'center' }}>
          {activeStep < 4 && !errorMessage ? (
            <>
              <CircularProgress size="2rem" />
              <Typography>{t('inProgress')}</Typography>
            </>
          ) : (
            <>
              {errorMessage ? (
                <>
                  <HighlightOffIcon color="error" fontSize="large" />
                  <Typography
                    color="GrayText"
                    component="pre"
                    sx={{ textAlign: 'left' }}
                  >
                    {t(errorMessage)}
                  </Typography>
                </>
              ) : (
                <>
                  <CheckCircleOutlineIcon color="success" fontSize="large" />
                  <Typography>{t('success')}</Typography>
                </>
              )}
              <Box>
                <Button onClick={onClose} sx={{ mt: 2 }} variant="contained">
                  {t('close')}
                </Button>
              </Box>
            </>
          )}
        </Stack>
      )}
    </Stack>
  );
};
