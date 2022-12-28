import { useCurrentUser } from './useCurrentUser';
import { PurchaseOpts, usePublicLock } from './usePublicLock';
import { useSupportingCreatorPlanForWrite } from './useSupportingCreatorsForWrite';

export const useSubscribeCreatorPlan = (
  creatorId: string,
  lockAddress: string
) => {
  const { currentUser } = useCurrentUser();

  const { purchase } = usePublicLock(lockAddress);

  const { addSupportingCreatorPlan } = useSupportingCreatorPlanForWrite();

  const subscribe = async (
    opts: PurchaseOpts,
    notificationSettings: NotificationSettings = {
      oneWeekBeforeExpiration: true,
      subscripionExpired: true,
      supportedCreatorNewPost: true,
    }
  ) => {
    if (!currentUser) throw Error('Need authentication');
    await purchase(opts);
    await addSupportingCreatorPlan({
      creatorId,
      lockAddress,
      notificationSettings,
    });
  };

  return { subscribe };
};
