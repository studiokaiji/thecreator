import Box from '@mui/material/Box';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';

export const CenterModal = (props: DialogProps) => (
  <Dialog {...props}>
    <DialogContent
      dividers={false}
      sx={{
        p: 4,
      }}
    >
      <Box>{props.children}</Box>
    </DialogContent>
  </Dialog>
);
