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

import {
  CenterModalWithTitle,
  CenterModalWithTitleProps,
} from './CenterModalWithTitle';

type CenterModalWithStatusProps = Omit<
  CenterModalWithTitleProps,
  'children' | 'components'
> & {
  components: {
    component: ReactNode;
    stepLabel: string;
    closable?: boolean;
  }[];
  completeComponent?: ReactNode;
  failedComponent?: ReactNode;
  activeStep: number;
  err?: any;
};

const Complete = ({ close }: { close: () => void }) => {
  const { t } = useTranslation();
  return (
    <Stack spacing={2}>
      <CheckCircleOutlineIcon
        color="success"
        fontSize="large"
        sx={{ mx: 'auto' }}
      />
      <Typography textAlign="center">{t('complete')}</Typography>
      <Button onClick={close} variant="contained">
        {t('close')}
      </Button>
    </Stack>
  );
};

const Failed = ({ close, err }: { close: () => void; err: any }) => {
  const { t } = useTranslation();
  return (
    <Stack spacing={2}>
      <CancelOutlinedIcon color="error" fontSize="large" sx={{ mx: 'auto' }} />
      <Typography>{t('failed')}</Typography>
      <Typography component="pre">{JSON.stringify(err, null, 2)}</Typography>
      <Button onClick={close} variant="contained">
        {t('close')}
      </Button>
    </Stack>
  );
};

export const CenterModalWithStatus = (props: CenterModalWithStatusProps) => {
  const { t } = useTranslation();

  const close = (
    event?: Record<string, never>,
    reason?: 'backdropClick' | 'escapeKeyDown'
  ) => {
    isClosable &&
      props.onClose &&
      (props.onClose as any)(event || {}, reason || '');
  };

  const steps = [
    ...props.components.map(({ stepLabel }) => stepLabel),
    t('complete'),
  ];

  const sections = [
    ...props.components.map(({ component }) => component),
    <Complete key={'complete'} close={close} />,
  ];

  const isClosable =
    steps.length - 1 <= props.activeStep ||
    !!props.err ||
    props.components[props.activeStep].closable;

  return (
    <CenterModalWithTitle {...props} components={undefined} onClose={close}>
      <Box>
        <Stepper alternativeLabel activeStep={props.activeStep}>
          {steps.map((step, i) => (
            <Step key={`step-${i}`}>
              <StepLabel>{step}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box sx={{ mt: 5 }}>
          {props.err ? (
            <Failed close={close} err={props.err} />
          ) : (
            sections[props.activeStep]
          )}
        </Box>
      </Box>
    </CenterModalWithTitle>
  );
};
