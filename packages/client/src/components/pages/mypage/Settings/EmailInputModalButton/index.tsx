import Button, { ButtonProps } from '@mui/material/Button';
import { MouseEvent, useState } from 'react';

import { EmailInput } from './EmailInput';

import { CenterModal } from '@/components/helpers/CenterModal';

type EmailInputModalButtonProps = {
  onComplete: (email: string) => void;
} & ButtonProps;

export const EmailInputModalButton = (props: EmailInputModalButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const onClickButtonHandler = (e: MouseEvent<HTMLButtonElement>) => {
    props.onClick && props.onClick(e);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Button {...props} onClick={onClickButtonHandler}>
        {props.children}
      </Button>
      <CenterModal onClose={close} open={isOpen}>
        <EmailInput onClose={close} onComplete={props.onComplete} />
      </CenterModal>
    </>
  );
};
