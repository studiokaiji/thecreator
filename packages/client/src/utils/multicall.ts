import { Contract, providers, Signer } from 'ethers';

import { MULTICALL } from '@/abis';

let contract: Contract;

export const aggregate = (
  params: unknown[],
  signerOrProvider?: providers.Provider | Signer
) => {
  contract = new Contract(
    import.meta.env.VITE_MULTICALL_ADDRESS,
    MULTICALL,
    signerOrProvider
  );
  return contract.callStatic.aggregate(params);
};
