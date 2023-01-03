import { useTranslation } from 'react-i18next';

import { PaginableTable } from '@/components/helpers/PaginableTable';
import { MainLoading } from '@/components/standalone/MainLoading';
import { useOnlyValidNetwork } from '@/hooks/useOnlyValidNetwork';
import { usePublicLockSupporters } from '@/hooks/usePublicLockSupporters';
import { blockTimestampToDate } from '@/utils/block-timestamp-to-date';

type SupportersTableProps = {
  planId: string;
};

export const SupportersTable = ({ planId }: SupportersTableProps) => {
  useOnlyValidNetwork();

  const {
    data: publicLockSupportersData,
    setSize,
    size,
  } = usePublicLockSupporters(planId);

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

  if (!data || typeof count !== 'number') {
    return <MainLoading />;
  }

  return (
    <PaginableTable
      data={data}
      headRows={rows}
      paging={{
        count,
        onPageChange: (_, page) => setSize(page),
        page: size - 1,
      }}
    />
  );
};
