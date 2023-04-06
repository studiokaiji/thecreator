import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { PaginableTable } from '@/components/helpers/PaginableTable';
import { useOnlyValidNetwork } from '@/hooks/useOnlyValidNetwork';
import { usePublicLockSupporters } from '@/hooks/usePublicLockSupporters';
import { blockTimestampToDate } from '@/utils/block-timestamp-to-date';

type SupportersTableProps = {
  planId?: string;
};

const BeforeMemonizedSupportersTable = ({ planId }: SupportersTableProps) => {
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

  return (
    <PaginableTable
      data={data || []}
      headRows={rows}
      loading={!data || typeof count !== 'number'}
      paging={{
        count: count || 0,
        onPageChange: (_, page) => setSize(page),
        page: size - 1,
      }}
    />
  );
};

export const SupportersTable = memo(BeforeMemonizedSupportersTable);
