import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { BigNumber, BigNumberish, constants } from 'ethers';
import { ReactNode, useCallback, useState } from 'react';
import { useFieldArray, useForm} from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FeatureTextField } from './FeatureTextField';

import { useCreatorPlanForWrite } from '@/hooks/useCreatorPlanForWrite';
import { currencyToTokenAddress } from '@/utils/currency-converter';
import { Plan } from '@/utils/get-plans-from-chain';
import { parseWeiUnits } from '@/utils/wei-units-converter';

const currency = 'USDC';

export type PlanFormValues = {
  priceEthPerMonth: number;
  name: string;
  description: string;
  features: Feature[];
  maxNumberOfMembers: BigNumberish;
};

type Feature = {
  feature: string;
};

type PlanFormProps = {
  onDone: (data: Plan) => void;
  onClose?: () => void;
  title: string;
  buttonChild: ReactNode;
  defaultValues?: Partial<PlanFormValues> & { id: string };
  update?: boolean;
  publicLockAddress?: string;
};

export const PlanForm = ({
  buttonChild,
  defaultValues = { id: '' },
  onClose,
  onDone,
  publicLockAddress,
  title,
  update,
}: PlanFormProps) => {
  if (!defaultValues.features || defaultValues.features.length < 1) {
    defaultValues.features = [{ feature: '' }];
  }

  const {
    control,
    formState: { errors, isValid },
    getValues,
    register,
    reset,
  } = useForm<PlanFormValues>({
    defaultValues,
    mode: 'onChange',
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

  const { addPlan, updatePlan } = useCreatorPlanForWrite(publicLockAddress);

  const onDoneHandler = async () => {
    try {
      setActiveStep(1);

      const {
        description,
        features,
        maxNumberOfMembers,
        name,
        priceEthPerMonth,
      } = getValues();

      const keyPrice = parseWeiUnits(priceEthPerMonth.toString(), currency);
      const maxNumberOfKeys = (() => {
        try {
          return BigNumber.from(maxNumberOfMembers);
        } catch {
          return constants.MaxUint256;
        }
      })();

      const tokenAddress = currencyToTokenAddress(currency);

      const data = {
        currency,
        description,
        features: features
          .filter(({ feature }) => feature)
          .map(({ feature }) => feature),
        isSubscribed: false,
        keyPrice,
        lockAddress: '',
        maxNumberOfKeys,
        name,
        tokenAddress,
      };

      if (update) {
        const sendedTxs = new Set();
        const confirmedTxs = new Set();

        const onSendTxHandler = (type: string) => {
          sendedTxs.add(type);
          if (sendedTxs.size >= 2) {
            setActiveStep(2);
          }
        };

        const onConfirmedTxHandler = (type: string) => {
          confirmedTxs.add(type);
          if (confirmedTxs.size >= 2) {
            setActiveStep(3);
          }
        };

        const defaultValuesData = {
          ...defaultValues,
          features:
            defaultValues.features
              ?.filter(({ feature }) => feature)
              .map(({ feature }) => feature) || [],
        };

        const updatableData = {
          ...data,
          id: defaultValuesData.id,
        };
        if (!updatableData.id) {
          throw Error('If you want to update, need id');
        }

        await updatePlan(defaultValuesData, updatableData, {
          onTxConfirmed: onConfirmedTxHandler,
          onTxSend: onSendTxHandler,
        });

        setActiveStep(4);

        reset();

        onDone({
          ...updatableData,
          keyPrice,
          maxNumberOfKeys,
          ok: true,
        });
      } else {
        const { data: plan } = await addPlan(data, {
          onCreateLockEnded: () => setActiveStep(3),
          onCreateLockTxSend: () => setActiveStep(2),
          onFailedToTxSend: (e) => setErrorMessage(JSON.stringify(e, null, 2)),
          onUserRejected: () => setErrorMessage(t('userRejectedRequest')),
        });

        setActiveStep(4);

        reset();

        onDone({
          ...plan,
          isSubscribed: false,
          keyPrice,
          maxNumberOfKeys,
          ok: true,
          tokenAddress,
        });
      }
    } catch (e) {
      setErrorMessage(JSON.stringify(e, null, 2));
      console.error(e);
    }
  };

  const valT = (key: string, opts?: any) => t(`validationErrors.${key}`, opts);

  return (
    <Stack spacing={5}>
      <Typography variant="h4">{title}</Typography>
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
            <TextField
              required
              {...register('priceEthPerMonth', {
                min: {
                  message: valT('mustBePositive'),
                  value: 10e-18,
                },
                required: valT('required'),
              })}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">{currency}</InputAdornment>
                ),
              }}
              error={!!errors.priceEthPerMonth}
              helperText={errors.priceEthPerMonth?.message}
              label={t('pricePerMonth')}
              placeholder={`${t('ex')}: 10`}
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
              helperText={
                errors.maxNumberOfMembers?.message || t('maxNumberOfMembersSub')
              }
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
                <FeatureTextField
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
            onClick={onDoneHandler}
            variant="contained"
          >
            {buttonChild}
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
