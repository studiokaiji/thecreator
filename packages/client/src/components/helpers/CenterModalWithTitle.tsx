import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { CenterModal, CenterModalProps } from './CenterModal';

export type CenterModalWithTitleProps = CenterModalProps & { title: string };

export const CenterModalWithTitle = (props: CenterModalWithTitleProps) => {
  return (
    <CenterModal {...props}>
      <Stack spacing={3}>
        <Typography variant="h4">{props.title}</Typography>
        {props.children}
      </Stack>
    </CenterModal>
  );
};
