import Box from '@mui/material/Box';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';

export type CenterModalProps = DialogProps;

export const CenterModal = (props: DialogProps) => (
  <Dialog {...props} sx={{}}>
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
