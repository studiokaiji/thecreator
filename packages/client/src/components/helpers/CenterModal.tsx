import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import Modal, { ModalProps } from '@mui/material/Modal';

type CenterModalProps = ModalProps & {
  width: string | number;
  maxWidth?: string | number;
  height?: string | number;
  maxHeight?: string | number;
};

export const CenterModal = (props: CenterModalProps) => (
  <Modal {...props}>
    <Fade in={props.open}>
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 1,
          boxShadow: 12,
          height: props.height,
          left: '50%',
          maxHeight: props.maxHeight,
          maxWidth: props.maxWidth,
          p: 4,
          position: 'absolute' as const,
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: props.width,
        }}
      >
        {props.children}
      </Box>
    </Fade>
  </Modal>
);