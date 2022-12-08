import { Contract, ContractInterface, providers, Signer } from 'ethers';

import { useWallet } from './useWallet';

export const useContract = (
  address: string,
  abi: ContractInterface,
  customSignerOrProvider?: providers.Provider | Signer
) => {
  const { library, switchChain: walletSwitchChain } = useWallet();

  const getContract = () => {
    const signer = customSignerOrProvider || library?.getSigner();
    return new Contract(address, abi, signer);
  };

  let contract: Contract = getContract();

  const switchChain = async () => {
    await walletSwitchChain();
    contract = getContract();
    return contract;
  };

  return { contract, switchChain };
};
