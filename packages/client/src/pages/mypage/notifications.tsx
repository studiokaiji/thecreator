import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import {
  Notification,
  NotificationProps,
} from '@/components/pages/mypage/Notifications/Notification';

export const NotificationsPage = () => {
  const { t } = useTranslation();

  const notifications: NotificationProps[] = [
    {
      creator: {
        creatorName: 'CREATOR',
        id: 'a',
      },
      data: {
        createdAt: new Date(2022, 1, 1),
        post: {
          id: 'POST_ID',
          title: 'POST_TITLE',
        },
        type: 'newPost',
      },
    },
    {
      creator: {
        creatorName: 'CREATOR',
        id: 'a',
      },
      data: {
        createdAt: new Date(2022, 1, 1),
        post: {
          id: 'POST_ID',
          title: 'POST_TITLE',
        },
        type: 'newPost',
      },
    },
  ];

  return (
    <Stack>
      <Typography p={3} variant="h4">
        {t('notifications')}
      </Typography>
      <Stack>
        {notifications.map((notification, i) => (
          <Box key={`notifications-${i}`}>
            <Divider />
            <Notification {...notification} />
          </Box>
        ))}
      </Stack>
    </Stack>
  );
};
