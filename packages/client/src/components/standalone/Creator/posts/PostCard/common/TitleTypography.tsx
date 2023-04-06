import Typography from '@mui/material/Typography';

export const TitleTypography = ({ title }: { title: string }) => {
  return (
    <Typography gutterBottom lineHeight={0.9} variant="h6">
      {title}
    </Typography>
  );
};
