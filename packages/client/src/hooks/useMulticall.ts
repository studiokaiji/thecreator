import { useContract } from './useContract';
import { useOnlyValidNetwork } from './useOnlyValidNetwork';

import { MULTICALL } from '@/abis';

export const useMulticall = () => {
  const { contract } = useContract(
    import.meta.env.VITE_MULTICALL_ADDRESS,
    MULTICALL
  );

  useOnlyValidNetwork();

  const aggregate = (params: unknown[]) => {
    return contract.callStatic.aggregate(params);
  };

  return { aggregate };
};
