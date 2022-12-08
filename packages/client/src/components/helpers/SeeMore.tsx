import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { PropsWithChildren, useRef, useState } from 'react';

type SeeMoreProps = {
  heightOnMinimized: number;
  onClickSeeMoreButton?: () => void;
  onClickCloseButton?: () => void;
  customSeeMoreButtonText?: string;
  customCloseButtonText?: string;
  displayAll?: boolean;
  color?: string;
} & PropsWithChildren;

export const SeeMore = ({
  children,
  color,
  customCloseButtonText = 'Close',
  customSeeMoreButtonText = 'See More',
  heightOnMinimized,
  onClickCloseButton,
  onClickSeeMoreButton,
}: SeeMoreProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const displaySwitch = () => {
    if (isOpen) {
      onClickCloseButton && onClickCloseButton();
    } else {
      onClickSeeMoreButton && onClickSeeMoreButton();
    }
    setIsOpen(!isOpen);
  };

  const childrenRef = useRef<HTMLDivElement>(null);

  const childrenHeight = childrenRef.current?.getBoundingClientRect().height;

  const isDisplayButton = childrenHeight && heightOnMinimized <= childrenHeight;

  return (
    <Box sx={{ margin: 'auto', position: 'relative', width: '100%' }}>
      <Box
        sx={(theme) => ({
          background: `linear-gradient(to top,${
            color || theme.palette.background.paper
          } 30%, transparent 100%)`,
          display: isOpen || !isDisplayButton ? 'none' : 'block',
          height: 50,
          position: 'absolute',
          top: heightOnMinimized - 50,
          width: '100%',
        })}
      />
      <Box
        sx={{
          maxHeight: isOpen ? 'auto' : heightOnMinimized,
          overflow: 'hidden',
          width: '100%',
        }}
      >
        <Box ref={childrenRef}>{children}</Box>
      </Box>
      {isDisplayButton && (
        <Box sx={{ textAlign: 'center' }}>
          <Button onClick={displaySwitch}>
            {isOpen ? customCloseButtonText : customSeeMoreButtonText}
          </Button>
        </Box>
      )}
    </Box>
  );
};
