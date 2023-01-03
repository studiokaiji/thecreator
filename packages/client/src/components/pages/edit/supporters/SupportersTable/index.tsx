import { useTranslation } from 'react-i18next';

import { PaginableTable } from '@/components/helpers/PaginableTable';
import { MainLoading } from '@/components/standalone/MainLoading';
import { useCreator } from '@/hooks/useCreator';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useOnlyValidNetwork } from '@/hooks/useOnlyValidNetwork';
import { usePublicLockSupporters } from '@/hooks/usePublicLockSupporters';
import { blockTimestampToDate } from '@/utils/block-timestamp-to-date';

export const SupportersTable = () => {
  useOnlyValidNetwork();

  const { currentUser } = useCurrentUser();
  const { data: creatorData } = useCreator({
    creatorAddress: currentUser?.uid,
  });
  const {
    data: publicLockSupportersData,
    setSize,
    size,
  } = usePublicLockSupporters(creatorData?.planIds[0]);

  const { t } = useTranslation();

  const rows = [t('supporter'), t('tokenId'), t('validity'), t('expiration')];

  const supportersData = publicLockSupportersData?.[size - 1];

  const data = supportersData?.results?.map(
    ({ id, isValidKey, keyExpirationTimestampFor, ownerOf }) => [
      ownerOf,
      id.toString(),
      isValidKey ? 'Valid' : 'Invalid',
      blockTimestampToDate(
        keyExpirationTimestampFor.toNumber()
      ).toLocaleDateString(),
    ]
  );

  const count = supportersData?.totalSupply.toNumber();

  if (!data || !count) {
    return <MainLoading />;
  }

  return (
    <PaginableTable
      data={data}
      headRows={rows}
      paging={{
        count,
        onPageChange: (_, page) => setSize(page),
        page: size,
      }}
    />
  );
};
