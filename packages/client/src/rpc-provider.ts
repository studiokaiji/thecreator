import { providers } from 'ethers';

export const rpcProvider = new providers.JsonRpcProvider(
  import.meta.env.VITE_RPC_ENDPOINT_URL
);
