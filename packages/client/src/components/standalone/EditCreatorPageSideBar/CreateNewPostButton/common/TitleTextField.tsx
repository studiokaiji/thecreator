import TextField, { TextFieldProps } from '@mui/material/TextField';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export const TitleTextField = (props: TextFieldProps) => {
  const { t } = useTranslation();
  const { formState, register } = useFormContext<{ title: string }>();
  return (
    <TextField
      required
      label={t('title')}
      {...register('title', {
        maxLength: t('validationErrors.maxLength', { maxLength: 80 }),
        required: t('validationErrors.required'),
      })}
      error={!!formState.errors.title?.message}
      helperText={formState.errors.title?.message}
      {...props}
    />
  );
};
