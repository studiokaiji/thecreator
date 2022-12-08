import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AddPlanActionForm } from './AddPlanActionForm';

import { CenterModal } from '@/components/helpers/CenterModal';

type AddPlanActionCardProps = {
  minHeight?: number | string;
  currentLengthOfPlans: number;
};

export const AddPlanActionCard = ({
  currentLengthOfPlans,
  minHeight,
}: AddPlanActionCardProps) => {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Card
        elevation={0}
        sx={{
          background: 'transparent',
        }}
      >
        <CardActionArea
          onClick={() => setIsOpen(true)}
          sx={{
            alignItems: 'center',
            border: '1px gray dotted',
            display: 'flex',
            justifyContent: 'center',
            minHeight,
            width: '100%',
          }}
        >
          <Typography fontWeight={500}>+ {t('addNewPlan')}</Typography>
        </CardActionArea>
      </Card>
      <CenterModal onClose={() => setIsOpen(false)} open={isOpen}>
        <AddPlanActionForm
          currentLengthOfPlans={currentLengthOfPlans}
          onAdded={console.log}
          onClose={() => setIsOpen(false)}
        />
      </CenterModal>
    </>
  );
};
