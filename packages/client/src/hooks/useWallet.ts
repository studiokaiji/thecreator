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

  const switchChain = async (chainId = 137) => {
    if (!web3React.library) throw Error('Not connected wallet');

    const hexChainId = `0x${chainId.toString(16)}`;

    try {
      await web3React.library.send('wallet_switchEthereumChain', [hexChainId]);
    } catch (e: any) {
      if (e.code === 4902 && chainId === 137) {
        await web3React.library.send('wallet_addEthereumChain', [
          {
            chainId: hexChainId,
            rpcUrl: import.meta.env.VITE_POLYGON_MAINNET_PROVIDER_RPC_URL,
          },
        ]);
      }
    }
  };

  useEffect(() => {
    connectors.injected.isAuthorized().then((isAuthorized: boolean) => {
      if (isAuthorized) {
        web3React.activate(connectors.injected, undefined, true);
      }
    });
  }, []);

  const account = web3React.account?.toLowerCase();

  return { ...web3React, account, activate, switchChain };
};
