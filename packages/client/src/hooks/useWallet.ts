import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { useEffect } from 'react';

export const connectors = {
  injected: new InjectedConnector({}),
  walletConnect: new WalletConnectConnector({
    bridge: 'https://bridge.walletconnect.org',
    qrcode: true,
    rpc: {
      1: import.meta.env.VITE_ETHEREUM_MAINNET_PROVIDER_RPC_URL,
      137: import.meta.env.VITE_POLYGON_MAINNET_PROVIDER_RPC_URL,
    },
  }),
};

export const useWallet = () => {
  const web3React = useWeb3React<Web3Provider>();

  const activate = (
    connector: keyof typeof connectors,
    onError?: (error: Error) => void,
    throwErrors?: boolean
  ) => web3React.activate(connectors[connector], onError, throwErrors);

  useEffect(() => {
    connectors.injected.isAuthorized().then((isAuthorized: boolean) => {
      if (isAuthorized) {
        web3React.activate(connectors.injected, undefined, true);
      }
    });
  }, []);

  return { ...web3React, activate };
};
