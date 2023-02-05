import { useFormContext } from 'react-hook-form';

import { PlansSelect } from '@/components/PlansSelect';
import { useCreatorPlans } from '@/hooks/useCreatorPlans';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export const CreateNewPostPlansSelect = () => {
  const { currentUser } = useCurrentUser();
  const { data: plans } = useCreatorPlans(currentUser?.uid);

  const form = useFormContext();

  if (!plans) {
    return <></>;
  }

  return <PlansSelect {...form.register('borderLockAddress')} />;
};
