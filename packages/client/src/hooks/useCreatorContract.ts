import { TheCreatorProduct, TheCreatorProduct__factory } from '@contracts';
import { useEffect, useState } from 'react';

import { useWallet } from './useWallet';

export const useCreatorContract = (address?: string) => {
  const { library } = useWallet();
  const [contract, setContract] = useState<TheCreatorProduct>();

  useEffect(() => {
    if (!library || !address) {
      return;
    }
    setContract(
      TheCreatorProduct__factory.connect(address, library.getSigner())
    );
  }, [library]);

  return contract;
};
