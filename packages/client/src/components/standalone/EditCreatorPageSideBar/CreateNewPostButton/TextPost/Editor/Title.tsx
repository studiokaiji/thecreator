import Input, { InputProps } from '@mui/material/Input';
import { useTranslation } from 'react-i18next';

export const EditorTitle = (props: InputProps) => {
  const { t } = useTranslation();
  return (
    <Input
      placeholder={t('title')}
      sx={{ fontSize: '1.75em', fontWeight: 500 }}
      {...props}
    />
  );
};
