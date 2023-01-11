import Avater from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import { MinimalLink } from '@/components/helpers/MinimalLink';
import type { Plan } from '@/utils/get-plans-from-chain';

export type NotificationProps = {
  creator: Pick<WithId<CreatorDocData>, 'id' | 'creatorName'>;
  data: Omit<NotificationDocData, 'creatorId' | 'planId'>;
  plan?: Pick<Plan, 'name' | 'id'>;
};

export const Notification = ({
  creator,
  data: { createdAt, post, type },
  plan,
}: NotificationProps) => {
  const { t } = useTranslation();

  const message = t(`notificationMessages.${type}`, {
    creator: creator.creatorName,
    plan: plan?.name,
    title: post?.title,
  });

  const to =
    type === 'newPost'
      ? `/c/${creator.id}/posts/${post?.title}`
      : `/c/${creator.id}`;

  return (
    <MinimalLink to={to}>
      <Stack
        alignItems="center"
        direction="row"
        justifyContent="space-between"
        px={3}
        py={1.75}
      >
        <Stack alignItems="center" direction="row" gap={1.5}>
          <Avater />
          <MinimalLink to={`/c/${creator.id}`}>
            <Typography>{message}</Typography>
          </MinimalLink>
        </Stack>
        <Typography variant="caption">
          {createdAt.toLocaleDateString()}
        </Typography>
      </Stack>
    </MinimalLink>
  );
};
