import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { CenterModalWithTitleProps } from './CenterModalWithTitle';

type CenterModalWithStatusProps = CenterModalWithTitleProps & {
  components: {
    component: ReactNode;
    stepLabel: string;
  }[];
  completeComponent?: ReactNode;
  failedComponent?: ReactNode;
  activeStep: number;
  err: any;
};

const Complete = () => {
  const { t } = useTranslation();
  return (
    <Stack spacing={3}>
      <CheckCircleOutlineIcon
        color="success"
        fontSize="large"
        sx={{ mx: 'auto' }}
      />
      <Typography textAlign="center">{t('complete')}</Typography>
    </Stack>
  );
};

const Failed = (err: any) => {
  const { t } = useTranslation();
  return (
    <Stack spacing={3}>
      <CancelOutlinedIcon color="error" fontSize="large" sx={{ mx: 'auto' }} />
      <Typography>{t('failed')}</Typography>
      <Typography component="pre">{JSON.stringify(err, null, 2)}</Typography>
    </Stack>
  );
};

export const CenterModalWithStatus = (props: CenterModalWithStatusProps) => {
  const { t } = useTranslation();

  const steps = [
    ...props.components.map(({ stepLabel }) => stepLabel),
    t('complete'),
  ];

  const sections = [
    ...props.components.map(({ component }) => component),
    <Complete key={'complete'} />,
  ];

  const isClosable = steps.length - 1 >= props.activeStep || !!props.err;

  return (
    <CenterModalWithStatus {...props}>
      <Box>
        <Stepper
          alternativeLabel
          activeStep={props.activeStep}
          sx={{ textAlign: 'center' }}
        >
          {steps.map((step, i) => (
            <Step key={`step-${i}`}>
              <StepLabel>{step}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box sx={{ mt: 5 }}>
          {props.err ? (
            <Failed err={props.err} />
          ) : (
            sections[props.activeStep]
          )}
        </Box>
        {isClosable && (
          <Box sx={{ mt: 3 }}>
            <Button>{t('close')}</Button>
          </Box>
        )}
      </Box>
    </CenterModalWithStatus>
  );
};
