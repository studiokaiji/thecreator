import RemoveIcon from '@mui/icons-material/Remove';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { UseFormRegister } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AddPlanActionFormValues } from '.';

type AddPlanActionFormFeatureTextFieldProps = {
  register: UseFormRegister<AddPlanActionFormValues>;
  index: number;
  onRemove: () => void;
  errorMessage?: string;
};

export const AddPlanActionFormFeatureTextField = ({
  errorMessage,
  index,
  onRemove,
  register,
}: AddPlanActionFormFeatureTextFieldProps) => {
  const { t } = useTranslation();

  return (
    <Stack alignItems="center" direction="row" spacing={0.5}>
      <IconButton onClick={onRemove} size="small">
        <RemoveIcon />
      </IconButton>
      <TextField
        {...register(`features.${index}.feature`, {
          maxLength: {
            message: t('validationErrors.maxLength', '40'),
            value: 80,
          },
        })}
        fullWidth
        error={!!errorMessage}
        helperText={errorMessage}
        label={`${t('feature')} ${index + 1}`}
        size="small"
      />
    </Stack>
  );
};
