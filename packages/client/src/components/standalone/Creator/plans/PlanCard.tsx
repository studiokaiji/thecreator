import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { BigNumber } from 'ethers';

type PlanCardProps = {
  title: string;
  description: string;
  features: string[];
  usage: BigNumber;
};

export const PlanCard = ({ description, features, title }: PlanCardProps) => (
  <Card sx={{ height: '100%', padding: 0, width: '100%' }}>
    <CardContent sx={{ textAlign: 'center' }}>
      <Typography gutterBottom variant="h6">
        {title}
      </Typography>
      <Typography color="GrayText" variant="body2">
        {description}
      </Typography>
    </CardContent>
  </Card>
);
