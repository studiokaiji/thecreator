import { BigNumber, constants } from 'ethers';

import { ExtendPeriodOpts, usePublicLock } from './usePublicLock';

export const useUserPublicLockKeysForWrite = (
  address = constants.AddressZero
) => {
  const { contract, extendPeriod } = usePublicLock(address);

  const extendPeriodAndGetNewExpirationTimestamp = async (
    opts: ExtendPeriodOpts
  ): Promise<BigNumber> => {
    await extendPeriod(opts);
    return contract.keyExpirationTimestampFor(opts.tokenId);
  };

  return { extendPeriodAndGetNewExpirationTimestamp };
};
