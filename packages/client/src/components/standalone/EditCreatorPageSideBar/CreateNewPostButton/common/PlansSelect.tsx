import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useCreatorPlans } from '@/hooks/useCreatorPlans';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export const PlansSelect = () => {
  const { currentUser } = useCurrentUser();
  const { data: plans } = useCreatorPlans(currentUser?.uid);

  const form = useFormContext();

  const { t } = useTranslation();

  if (!plans) {
    return <></>;
  }

  return (
    <Controller
      control={form.control}
      name={'borderLockAddress'}
      render={({ field }) => (
        <TextField
          required
          select
          helperText={t('newPostPlansSelectHelperText')}
          label={t('plan')}
          variant="standard"
          {...field}
          defaultValue={plans?.[0].id}
        >
          {plans?.map((plan) => (
            <MenuItem key={`plan-select-${plan.id}`} value={plan.id}>
              <>
                {plan.name} ({plan.id})
              </>
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );
};
