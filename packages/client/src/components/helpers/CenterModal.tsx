import Box from '@mui/material/Box';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';

export type CenterModalProps = DialogProps & {
  maxWidth?: string | number;
  maxHeight?: string | number;
};

export const CenterModal = (props: CenterModalProps) => (
  <Dialog {...props}>
    <DialogContent
      dividers={false}
      sx={{
        p: 4,
      }}
    >
      <Box
        sx={{
          maxHeight: props.maxHeight,
          maxWidth: props.maxWidth,
        }}
      >
        {props.children}
      </Box>
    </DialogContent>
  </Dialog>
);
