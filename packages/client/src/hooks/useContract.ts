import { Contract, ContractInterface, providers, Signer } from 'ethers';

import { useWallet } from './useWallet';

export const useContract = (
  address: string,
  abi: ContractInterface,
  customSignerOrProvider?: providers.Provider | Signer
) => {
  const { library } = useWallet();
  const signer = customSignerOrProvider || library?.getSigner();
  return new Contract(address, abi, signer);
};
