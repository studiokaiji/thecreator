import { Contract, providers } from 'ethers';

import { MULTICALL } from '@/abis';

let contract: Contract;

export const aggregate = (
  params: unknown[],
  signerOrAddress?: providers.Provider
) => {
  contract = new Contract(
    import.meta.env.VITE_MULTICALL_ADDRESS,
    MULTICALL,
    signerOrAddress
  );
  return contract.callStatic.aggregate(params);
};
