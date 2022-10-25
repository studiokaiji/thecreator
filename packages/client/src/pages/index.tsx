import { useAuth } from '@/hooks/useAuth';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useWallet } from '@/hooks/useWallet';

export const IndexPage = () => {
  const { account, active, chainId } = useWallet();

  const { signIn, signOut } = useAuth();
  const { currentUser } = useCurrentUser();

  return (
    <div>
      <div>Connection Status: {active.toString()}</div>
      <p>Account: {account?.toString()}</p>
      <div>Network ID: {chainId?.toString()}</div>
      <div>CurrentUser: {JSON.stringify(currentUser, null, 2)}</div>
      <button onClick={() => (active ? signIn('injected') : signOut())}>
        {active ? 'Disconnect Wallet' : 'Connect Wallet'}
      </button>
    </div>
  );
};
