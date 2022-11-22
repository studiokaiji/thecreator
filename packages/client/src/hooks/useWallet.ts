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
      [import.meta.env.VITE_CHAIN_ID]: import.meta.env
        .VITE_WALLET_PROVIDER_RPC_URL,
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

  const switchChain = async () => {
    if (!web3React.library) throw Error('Not connected wallet');

    const hexChainId = `0x${Number(import.meta.env.VITE_CHAIN_ID).toString(
      16
    )}`;

    try {
      await web3React.library.send('wallet_switchEthereumChain', [
        {
          chainId: hexChainId,
        },
      ]);
    } catch (switchErr) {
      if (
        (switchErr as { code: number }).code !== 4902 ||
        !import.meta.env.DEV
      ) {
        throw switchErr;
      }

      await web3React.library.send('wallet_addEthereumChain', [
        {
          blockExplorerUrls: import.meta.env.VITE_POLYGON_MAINNET_EXPLORER_URL,
          chainId: hexChainId,
          chainName: import.meta.env.VITE_POLYGON_MAINNET_PROVIDER_CHAIN_NAME,
          nativeCurrency: {
            decimals: import.meta.env.VITE_POLYGON_DECIMALS,
            name: import.meta.env.VITE_POLYGON_NAME,
            symbol: import.meta.env.VITE_POLYGON_SYMBOL,
          },
          rpcUrls: import.meta.env.VITE_POLYGON_MAINNET_WALLET_PROVIDER_RPC_URL,
        },
      ]);
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
