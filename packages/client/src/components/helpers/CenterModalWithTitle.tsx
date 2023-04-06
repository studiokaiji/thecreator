import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import { CenterModalProps } from './CenterModal';

export type CenterModalWithTitleProps = CenterModalProps & { title: string };

export const CenterModalWithTitle = (props: CenterModalWithTitleProps) => {
  return (
    <Dialog {...props} sx={{}}>
      <DialogTitle>{props.title}</DialogTitle>
      <DialogContent
        dividers={false}
        sx={
          props.sx || {
            p: 4,
          }
        }
      >
        <Box>{props.children}</Box>
      </DialogContent>
    </Dialog>
  );
};
