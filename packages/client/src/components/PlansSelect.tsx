import MenuItem from '@mui/material/MenuItem';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { useTranslation } from 'react-i18next';

import { useCreatorPlans } from '@/hooks/useCreatorPlans';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export const PlansSelect = (props: TextFieldProps) => {
  const { currentUser } = useCurrentUser();
  const { data: plans } = useCreatorPlans(currentUser?.uid);

  const { t } = useTranslation();

  if (!plans) {
    return <></>;
  }

  return (
    <TextField
      required
      select
      helperText={t('newPostPlansSelectHelperText')}
      label={t('plan')}
      variant="standard"
      {...props}
      defaultValue={plans[0].id}
    >
      {plans.map((plan) => (
        <MenuItem key={`plan-select-${plan.id}`} value={plan.id}>
          <>
            {plan.name} ({plan.id})
          </>
        </MenuItem>
      ))}
    </TextField>
  );
};
