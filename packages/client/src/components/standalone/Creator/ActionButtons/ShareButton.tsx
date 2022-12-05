import LinkIcon from '@mui/icons-material/Link';
import ShareIcon from '@mui/icons-material/ShareOutlined';
import TwitterIcon from '@mui/icons-material/Twitter';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import { MouseEvent, ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CreatorDocData } from '#types/firestore/creator';
import { RoundedButton } from '@/components/helpers/RoundedButton';
import { useSnackbar } from '@/hooks/useSnackbar';

export const ShareButton = ({
  data,
  minimize,
}: {
  minimize: boolean;
  data: CreatorDocData;
}) => {
  const { t } = useTranslation();

  const { open: openSnackBar } = useSnackbar();

  const url = `${window.location.protocol}//${window.location.host}/c/${data.id}`;

  const availableShares: {
    icon: ReactNode;
    displayName: string;
    action?: () => void;
    href?: string;
  }[] = [
    {
      displayName: 'Twitter',
      href: `http://twitter.com/share?url=${url}&text=${data.creatorName}%20Page&hashtags=TheCreator`,
      icon: <TwitterIcon sx={{ color: 'rgb(29, 155, 240)' }} />,
    },
    {
      action: () => {
        navigator.clipboard
          .writeText(url)
          .then(() => openSnackBar(t('copySuccessed'), 'success'));
      },
      displayName: t('copyLink'),
      icon: <LinkIcon />,
    },
  ];

  const [isOpen, setIsOpen] = useState(false);

  const open = (event: MouseEvent<HTMLButtonElement>) => {
    setIsOpen(true);
    setAnchorEl(event.currentTarget);
  };
  const close = () => {
    setIsOpen(false);
    setAnchorEl(null);
  };

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const onClickShareButtonHandler = (index: number) => {
    const { action, href } = availableShares[index];
    if (href) {
      window.open(
        href,
        undefined,
        'width=600,height=350,toolbar=yes,menubar=yes,scrollbars=yes'
      );
    }
    if (action) {
      action();
    }
  };

  return (
    <>
      {minimize ? (
        <IconButton onClick={open}>
          <ShareIcon />
        </IconButton>
      ) : (
        <RoundedButton
          onClick={open}
          startIcon={<ShareIcon />}
          variant="outlined"
        >
          {t('share')}
        </RoundedButton>
      )}
      <Popover
        anchorEl={anchorEl}
        anchorOrigin={{
          horizontal: 'left',
          vertical: 'bottom',
        }}
        onClose={close}
        open={isOpen}
      >
        <List sx={{ p: 0 }}>
          {availableShares.map(({ displayName, icon }, i) => (
            <ListItem key={`shares-${i}`} sx={{ p: 0 }}>
              <ListItemButton
                onClick={() => onClickShareButtonHandler(i)}
                sx={{ px: 1.5 }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>{icon}</ListItemIcon>
                <ListItemText>
                  <Typography fontWeight={500} variant="body2">
                    {displayName}
                  </Typography>
                </ListItemText>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Popover>
    </>
  );
};
