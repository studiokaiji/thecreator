import { useWallet } from '../hooks/useWallet';

export const IndexPage = () => {
  const { account, activate, active, chainId, deactivate } = useWallet();

  return (
    <div>
      <div>Connection Status: {active.toString()}</div>
      <p>Account: {account?.toString()}</p>
      <div>Network ID: {chainId?.toString()}</div>
      <button onClick={() => (active ? deactivate() : activate('injected'))}>
        {active ? 'Disconnect Wallet' : 'Connect Wallet'}
      </button>
    </div>
  );
};
