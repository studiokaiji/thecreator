import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { FC, PropsWithChildren } from 'react';
import { Outlet } from 'react-router-dom';

import { CenterModal } from '@/components/helpers/CenterModal';
import { Auth } from '@/components/standalone/Auth/index';
import { MainLoading } from '@/components/standalone/MainLoading';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export const RouteAuthGuard: FC<Partial<PropsWithChildren>> = ({
  children,
}) => {
  const { checking, currentUser } = useCurrentUser();

  if (checking && !currentUser) {
    return <MainLoading />;
  }

  if (!currentUser) {
    return (
      <>
        <CenterModal open={true}>
          <Stack spacing={3}>
            <Typography variant="h5">Auth</Typography>
            <Auth />
          </Stack>
        </CenterModal>
        <Outlet />
      </>
    );
  }

  if (children) {
    return <>{children}</>;
  }

  return <Outlet />;
};
