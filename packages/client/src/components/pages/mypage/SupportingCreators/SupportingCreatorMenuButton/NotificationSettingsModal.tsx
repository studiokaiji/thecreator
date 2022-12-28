import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { CenterModalWithTitle } from '@/components/helpers/CenterModalWithTitle';

type NotificationSettingsProps = {
  isOpen: boolean;
  onClose: () => void;
  notificationSettings: NotificationSettings;
  onUpdateNotificationSettings: (
    notificationSettings: NotificationSettings
  ) => Promise<void>;
};

export const NotificationSettingsModal = ({
  isOpen,
  notificationSettings,
  onClose,
  onUpdateNotificationSettings,
}: NotificationSettingsProps) => {
  const { t } = useTranslation();

  const { control, getValues } = useForm<NotificationSettings>({
    defaultValues: notificationSettings,
    mode: 'onChange',
  });

  const updateNotification = async () => {
    const settings = getValues();
    onUpdateNotificationSettings(settings)
      .then(() => open(t('saveSuccessed'), 'success'))
      .catch(() => open(t('saveFailed'), 'error'));
    onClose();
  };

  return (
    <CenterModalWithTitle
      onClose={onClose}
      open={isOpen}
      title={t('notificationSettings')}
    >
      <Stack spacing={3}>
        <Stack>
          {(
            Object.keys(
              notificationSettings
            ) as (keyof typeof notificationSettings)[]
          ).map((key) => (
            <Controller
              key={key}
              control={control}
              name={key}
              render={({ field }) => (
                <FormControlLabel
                  {...field}
                  key={key}
                  control={
                    <Switch
                      checked={field.value}
                      color="primary"
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label={t(key)}
                  labelPlacement="start"
                  sx={{ justifyContent: 'space-between', m: 0 }}
                />
              )}
            />
          ))}
        </Stack>
        <Button onClick={updateNotification} variant="contained">
          {t('save')}
        </Button>
      </Stack>
    </CenterModalWithTitle>
  );
};
