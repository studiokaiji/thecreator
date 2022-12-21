import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Table } from '@/components/helpers/Table';
import { IconWithMessage } from '@/components/standalone/IconWithMessage';
import { useSupportingCreators } from '@/hooks/useSupportingCreators';
import { useUserPublicLockKeys } from '@/hooks/useUserPublicLockKeys';
import { blockTimestampToDate } from '@/utils/block-timestamp-to-date';

export const SupportingCreators = () => {
  const { t } = useTranslation();
  const [checkedCells, setCheckedCells] = useState<boolean[]>([]);

  const { data: supportingCreators, error: supportingCreatorsError } =
    useSupportingCreators();

  const { data: lockKeys, error: lockKeysError } = useUserPublicLockKeys(
    supportingCreators?.map((d) => d.plan.lockAddress)
  );

  const checkAll = (e: ChangeEvent<HTMLInputElement>) => {
    if (!supportingCreators) return;
    setCheckedCells(supportingCreators.map(() => e.target.checked));
  };

  const check = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const current = [...checkedCells];
    current[index] = e.target.checked;
    setCheckedCells(current);
  };

  if (supportingCreatorsError || lockKeysError) {
    const errMessage = JSON.stringify(
      supportingCreatorsError || lockKeysError,
      null,
      2
    );
    return <pre>{errMessage}</pre>;
  }

  const rows = [
    <Checkbox
      key="all-supporting-creaotors-checkbox"
      checked={checkedCells.every((c) => c)}
      onChange={checkAll}
    />,
    t('creator'),
    t('tokenId'),
    t('expiringAt'),
    t('subscribedAt'),
  ];

  return (
    <Stack>
      <Typography sx={{ p: 3, pb: 2 }} variant="h4">
        {t('supportingCreators')}
      </Typography>
      {supportingCreators ? (
        supportingCreators.length > 1 ? (
          <Table
            data={supportingCreators.map((d, i) => {
              return [
                <Checkbox
                  key={`supporting-creaotors-checkbox-${i}`}
                  checked={checkedCells.every((c) => c)}
                  onChange={(e) => check(e, i)}
                />,
                d.creator?.creatorName || '',
                lockKeys?.[i].tokenId.toString() || '',
                lockKeys?.[i].timestamp
                  ? blockTimestampToDate(lockKeys[i].timestamp).toLocaleString()
                  : '',
                d.supportedAt.toLocaleString(),
              ];
            })}
            elevation={0}
            headRows={rows}
          />
        ) : (
          <IconWithMessage
            icon={PersonOffOutlinedIcon}
            message={t('supportingCreatorDoesNotExist')}
          />
        )
      ) : (
        <CircularProgress />
      )}
    </Stack>
  );
};
