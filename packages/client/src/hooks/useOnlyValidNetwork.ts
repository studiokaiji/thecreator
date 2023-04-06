import { useEffect } from 'react';

import { useWallet } from './useWallet';

export const useOnlyValidNetwork = () => {
  const { chainId, library, switchChain } = useWallet();

  useEffect(() => {
    if (!library) return;

    library.getNetwork().then(async (network) => {
      if (Number(import.meta.env.VITE_CHAIN_ID) !== network.chainId) {
        await switchChain();
      }
    });

    const onChainChangedHandler = async (strChainId: string) => {
      if (import.meta.env.VITE_CHAIN_ID !== strChainId) {
        await switchChain();
      }
    };
    library.off('chainChanged', onChainChangedHandler);
    library.on('chainChanged', onChainChangedHandler);
  }, [library]);

  return chainId === Number(import.meta.env.VITE_CHAIN_ID);
};
