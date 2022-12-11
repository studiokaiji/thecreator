import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AddPlanActionForm } from './AddPlanActionForm';

import { CenterModal } from '@/components/helpers/CenterModal';
import { Plan } from '@/utils/get-plans-from-chain';

type AddPlanActionCardProps = {
  minHeight?: number | string;
  onAdded: (data: Plan) => void;
};

export const AddPlanActionCard = ({
  minHeight,
  onAdded,
}: AddPlanActionCardProps) => {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Card
        elevation={0}
        sx={{
          background: 'transparent',
          height: '100%',
        }}
      >
        <CardActionArea
          onClick={() => setIsOpen(true)}
          sx={{
            alignItems: 'center',
            border: '1px gray dotted',
            display: 'flex',
            height: '100%',
            justifyContent: 'center',
            minHeight,
            width: '100%',
          }}
        >
          <Typography fontWeight={500}>+ {t('addNewPlan')}</Typography>
        </CardActionArea>
      </Card>
      <CenterModal onClose={() => setIsOpen(false)} open={isOpen}>
        <AddPlanActionForm onAdded={onAdded} onClose={() => setIsOpen(false)} />
      </CenterModal>
    </>
  );
};
