import { CircularProgress } from '@mui/material';
import Stack from '@mui/material/Stack';

import { AuthIconButton } from './AuthIconButton';

import metamaskLogoPath from '@/assets/metamask-logo.svg';
import walletConnectLogoPath from '@/assets/walletconnect-logo.svg';
import { useAuth } from '@/hooks/useAuth';

export const Auth = () => {
  const { processing, signIn } = useAuth();

  if (processing) {
    return (
      <Stack>
        <CircularProgress sx={{ mb: 3, mx: 'auto' }} />
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <AuthIconButton
        iconSrc={metamaskLogoPath}
        onClick={() => signIn('injected')}
      >
        Metamask
      </AuthIconButton>
      <AuthIconButton
        iconSrc={walletConnectLogoPath}
        onClick={() => signIn('walletConnect')}
      >
        Wallet Connect
      </AuthIconButton>
    </Stack>
  );
};
