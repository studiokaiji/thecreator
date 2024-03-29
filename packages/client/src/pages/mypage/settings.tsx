import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { EmailInputModalButton } from '@/components/pages/mypage/Settings/EmailInputModalButton';
import { useUser } from '@/hooks/useUser';

export const UserSettingsPage = () => {
  const { data, error, mutate, updateUserSettings } = useUser();

  const { t } = useTranslation();

  const { control, setValue, watch } = useForm<UserDocData>({
    defaultValues: {
      globalNotificationSettings: {
        oneWeekBeforeExpiration: true,
        subscriptionExpired: true,
        supportedCreatorNewPost: true,
      },
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (!data?.globalNotificationSettings) return;
    setValue('globalNotificationSettings', data.globalNotificationSettings);
  }, [data]);

  const watched = watch();

  const isChanged = useMemo(() => {
    if (!data || !data.globalNotificationSettings) return false;
    for (const k of Object.keys(
      data.globalNotificationSettings
    ) as (keyof NotificationSettings)[]) {
      if (
        data.globalNotificationSettings[k] !==
        watched.globalNotificationSettings[k]
      ) {
        return true;
      }
    }
    return false;
  }, [data, watched]);

  if (error) {
    return <pre>{JSON.stringify(error, null, 2)}</pre>;
  }

  if (!data || !data?.globalNotificationSettings) {
    return (
      <Stack>
        <CircularProgress sx={{ m: 3, mx: 'auto' }} />
      </Stack>
    );
  }

  const save = async () => {
    if (!data.globalNotificationSettings || !isChanged) {
      return;
    }

    const newData: WithId<UserDocData> = {
      globalNotificationSettings: {
        ...data.globalNotificationSettings,
        ...watched.globalNotificationSettings,
      },
      id: data.id,
    };

    await updateUserSettings(newData);
    await mutate({ ...data, ...newData }, false);
  };

  const onEmailUpdated = async (email: string) => {
    await mutate({ ...data, email }, false);
  };

  return (
    <>
      <Stack spacing={3} sx={{ p: 3 }}>
        <Typography variant="h4">{t('settings')}</Typography>

        <Stack spacing={2}>
          <Typography variant="h6">{t('emailNotification')}</Typography>
          <Stack justifyContent="left" sx={{ maxWidth: 290 }}>
            {data?.globalNotificationSettings &&
              (
                Object.keys(
                  data?.globalNotificationSettings
                ) as (keyof NotificationSettings)[]
              ).map((key) => (
                <Controller
                  key={key}
                  control={control}
                  name={`globalNotificationSettings.${key}`}
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
          <Stack direction="row">
            <Button disabled={!isChanged} onClick={save} variant="contained">
              {t('save')}
            </Button>
          </Stack>
        </Stack>

        <Stack spacing={2}>
          <Typography variant="h6">{t('email')}</Typography>
          {data.email && (
            <Typography>
              {data.email}
              <Typography
                color="red"
                fontWeight={500}
                sx={{ display: 'inline', ml: 1 }}
              >
                {!data.emailVerified && 'Unverified'}
              </Typography>
            </Typography>
          )}
          <Stack direction="row">
            <EmailInputModalButton
              onComplete={onEmailUpdated}
              variant="outlined"
            >
              {t('changeEmail')}
            </EmailInputModalButton>
          </Stack>
        </Stack>
      </Stack>
    </>
  );
};
