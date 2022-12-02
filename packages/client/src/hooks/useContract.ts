import { Contract, ContractInterface, providers, Signer } from 'ethers';

import { useWallet } from './useWallet';

export const useContract = (
  address: string,
  abi: ContractInterface,
  customSignerOrProvider?: providers.Provider | Signer
) => {
  const { library } = useWallet();
  return new Contract(address, abi, customSignerOrProvider || library);
};
