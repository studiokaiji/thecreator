import { BigNumber, BigNumberish } from 'ethers';

export const blockTimestampToDate = (timestamp: BigNumberish) => {
  const millTimestamp = blockTimestampToMillisecondsTimestamp(timestamp);
  return new Date(millTimestamp * 1000);
};

export const blockTimestampToMillisecondsTimestamp = (
  timestamp: BigNumberish
) => {
  return BigNumber.from(timestamp).toNumber();
};
