import { isAddress } from 'ethers/lib/utils';

import { rpcProvider } from '@/rpc-provider';

export const getPublicLockAddressByTxHash = async (txHash: string) => {
  const { logs } = await rpcProvider.getTransactionReceipt(txHash);
  const address = logs[0].address;
  if (!address || !isAddress(address)) {
    throw Error('Invalid transaction');
  }
  return address;
};
