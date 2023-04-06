import { TextField } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export const DescriptionTextField = () => {
  const { t } = useTranslation();
  const { formState, register } = useFormContext<{ description: string }>();
  return (
    <TextField
      label={t('description')}
      variant="standard"
      {...register('description', {
        maxLength: {
          message: t('validationErrors.maxLength', {
            maxLength: '1000',
          }),
          value: 1000,
        },
      })}
      multiline
      error={!!formState.errors.description?.message}
      helperText={formState.errors.description?.message}
      rows={4}
    />
  );
};
