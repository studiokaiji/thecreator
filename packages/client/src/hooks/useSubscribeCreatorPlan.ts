import { useCurrentUser } from './useCurrentUser';
import { PurchaseOpts, usePublicLock } from './usePublicLock';
import { useSupportingCreatorsForWrite } from './useSupportingCreatorsForWrite';

export const useSubscribeCreatorPlan = (
  creatorId: string,
  lockAddress?: string
) => {
  const { currentUser } = useCurrentUser();

  const { purchase } = usePublicLock(lockAddress);

  const { addSupportingCreator } = useSupportingCreatorsForWrite();

  const subscribe = async (
    opts: PurchaseOpts,
    notificationSettings: NotificationSettings = {
      oneWeekBeforeExpiration: true,
      subscripionExpired: true,
      supportedCreatorNewPost: true,
    }
  ) => {
    if (!currentUser) throw Error('Need authentication');
    if (!lockAddress) throw Error('need lock address');
    await purchase(opts);
    await addSupportingCreator(creatorId, {
      lockAddress,
      notificationSettings,
    });
  };

  return { subscribe };
};
