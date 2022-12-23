import { useCreator } from './useCreator';
import { useCreatorForWrite } from './useCreatorForWrite';
import { useCurrentUser } from './useCurrentUser';

export const useCreatorSettings = () => {
  const { currentUser } = useCurrentUser();
  const { data, error, mutate } = useCreator({
    creatorAddress: currentUser?.uid,
  });
  const { updateCreator } = useCreatorForWrite();

  const updateSettings = async (settings: CreatorDocSettings) => {
    await updateCreator({ settings });
    await mutateSettings(settings);
  };

  const mutateSettings = async (settings: CreatorDocSettings) => {
    if (data) {
      await mutate({ ...data, settings });
    }
  };

  return {
    data: data?.settings,
    error,
    mutate: mutateSettings,
    updateSettings,
  };
};
