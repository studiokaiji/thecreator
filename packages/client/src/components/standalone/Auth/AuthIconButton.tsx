import Button, { ButtonProps } from '@mui/material/Button';

type AuthIconButtonProps = {
  iconSrc: string;
} & ButtonProps;

export const AuthIconButton = (props: AuthIconButtonProps) => {
  return (
    <Button
      startIcon={<img src={props.iconSrc} width={28} />}
      {...props}
      variant="outlined"
    >
      {props.children}
    </Button>
  );
};
