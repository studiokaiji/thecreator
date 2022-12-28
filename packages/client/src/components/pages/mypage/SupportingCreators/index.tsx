import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { BigNumber } from 'ethers';
import { ChangeEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SupportingCreatorMenuButton } from './SupportingCreatorMenuButton';

import { Table } from '@/components/helpers/Table';
import { IconWithMessage } from '@/components/standalone/IconWithMessage';
import { useSupportingCreators } from '@/hooks/useSupportingCreators';
import { blockTimestampToDate } from '@/utils/block-timestamp-to-date';

export const SupportingCreators = () => {
  const { t } = useTranslation();
  const [checkedCells, setCheckedCells] = useState<boolean[]>([]);

  const {
    data: supportingCreators,
    error: supportingCreatorsError,
    mutate: mutateNewSupportingCreators,
  } = useSupportingCreators();

  const onExtendHandler = (
    lockAddress: string,
    tokenId: BigNumber,
    timestamp: BigNumber
  ) => {
    if (!supportingCreators) {
      return;
    }

    const index = supportingCreators.findIndex(
      (v) => (v.lockAddress = lockAddress)
    );
    if (index === -1) {
      return;
    }

    const newSupportingCreators = [...supportingCreators];
    newSupportingCreators[index].timestamp = timestamp;
    newSupportingCreators[index].tokenId = tokenId;

    mutateNewSupportingCreators([newSupportingCreators]);
  };

  useEffect(() => {
    if (!checkedCells.length && supportingCreators) {
      setCheckedCells(supportingCreators.map(() => false));
    }
  }, [supportingCreators]);

  const checkAll = (e: ChangeEvent<HTMLInputElement>) => {
    if (!supportingCreators) return;
    setCheckedCells(supportingCreators.map(() => e.target.checked));
  };

  const check = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const current = [...checkedCells];
    current[index] = e.target.checked;
    setCheckedCells(current);
  };

  if (supportingCreatorsError) {
    const errMessage = JSON.stringify(supportingCreatorsError, null, 2);
    return <pre>{errMessage}</pre>;
  }

  const rows = [
    <Checkbox
      key="all-supporting-creaotors-checkbox"
      checked={checkedCells.every((c) => c)}
      onChange={checkAll}
    />,
    t('creator'),
    t('plan'),
    t('tokenId'),
    t('expiration'),
    t('subscribed'),
    '',
  ];

  return (
    <Stack>
      <Typography sx={{ p: 3, pb: 2 }} variant="h4">
        {t('supportingCreators')}
      </Typography>
      {supportingCreators ? (
        supportingCreators.length > 0 ? (
          <Table
            data={supportingCreators.map((d, i) => {
              return [
                <Checkbox
                  key={`supporting-creaotors-checkbox-${i}`}
                  checked={checkedCells.every((c) => c)}
                  onChange={(e) => check(e, i)}
                />,
                d.creator?.creatorName || '',
                d.planName,
                d.tokenId.toString() || '',
                d.timestamp
                  ? blockTimestampToDate(d.timestamp).toLocaleDateString()
                  : '',
                d.supportedAt.toLocaleDateString(),
                <SupportingCreatorMenuButton
                  key={`supporting-creaotors-menu-button-${i}`}
                  data={d}
                  onExtend={onExtendHandler}
                />,
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
