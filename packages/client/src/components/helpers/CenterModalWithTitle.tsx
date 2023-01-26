import DialogTitle from '@mui/material/DialogTitle';

import { CenterModal, CenterModalProps } from './CenterModal';

export type CenterModalWithTitleProps = CenterModalProps & { title: string };

export const CenterModalWithTitle = (props: CenterModalWithTitleProps) => {
  return (
    <CenterModal {...props}>
      <DialogTitle>{props.title}</DialogTitle>
    </CenterModal>
  );
};
