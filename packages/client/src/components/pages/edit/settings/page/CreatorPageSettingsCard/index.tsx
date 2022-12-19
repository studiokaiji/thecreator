import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CreatorDocSettings } from '#types/firestore/creator';

type CreatorPageSettingsCardProps = {
  values: CreatorDocSettings;
  onChange: (value: CreatorDocSettings) => void;
};

export const CreatorPageSettingsCard = ({
  onChange,
  values,
}: CreatorPageSettingsCardProps) => {
  const { t } = useTranslation();

  const [isOpenEnableNSFWAlert, setIsOpenEnableNSFWAlert] = useState(false);

  const openEnableNSFWAlert = () => {
    setIsOpenEnableNSFWAlert(true);
  };

  const closeEnableNSFWAlert = () => {
    setIsOpenEnableNSFWAlert(false);
  };

  const enableNSFWAccount = () => {
    openEnableNSFWAlert();
    onChange({ ...values, isNSFW: true });
  };

  const onChangePublishPageHandler = () => {
    onChange({ ...values, isPublish: !values.isPublish });
  };

  return (
    <>
      <Card sx={{ padding: 3.5 }}>
        <Stack spacing={2}>
          <Typography variant="h5">{t('page')}</Typography>
          <Stack spacing={1}>
            <Stack alignItems="center" direction="row" gap={1.5}>
              <Typography>{t('nsfwAccount')}</Typography>
              <Button
                disabled={values.isNSFW}
                onClick={openEnableNSFWAlert}
                variant="contained"
              >
                {t(values.isNSFW ? 'enabled' : 'enable')}
              </Button>
            </Stack>
            <Typography color="red" variant="caption">
              {t('nsfwAccountSettingsCaution')}
            </Typography>
          </Stack>
          <Stack>
            <FormControlLabel
              checked={values.isPublish}
              control={<Switch />}
              label={t('publishPage')}
              labelPlacement="start"
              onChange={onChangePublishPageHandler}
              sx={{ justifyContent: 'left', ml: 0 }}
            />
            <Typography variant="caption">{t('publishPageMessage')}</Typography>
          </Stack>
        </Stack>
      </Card>
      <Dialog onClose={close} open={isOpenEnableNSFWAlert}>
        <DialogTitle textAlign="left">
          {t('nsfwAccountDialogTitle')}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <DialogContentText>
              {t('nsfwAccountSettingsCaution')}
            </DialogContentText>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEnableNSFWAlert}>{t('back')}</Button>
          <Button autoFocus onClick={enableNSFWAccount}>
            {t('enable')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
