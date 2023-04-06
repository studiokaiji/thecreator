import { BigNumberish, utils } from 'ethers';

import { currencies, currencyDecimals } from '@/constants';

export const formatWeiUnits = (
  wei: BigNumberish,
  currency: typeof currencies[number],
  floor = 5
) => {
  const unit = currencyDecimals[currency];
  const formatted = Number(utils.formatUnits(wei, unit));
  const fl = 10 ** floor;
  const floored = Math.floor(formatted * fl) / fl;
  return floored;
};

export const parseWeiUnits = (
  value: string,
  currency: typeof currencies[number]
) => {
  const unit = currencyDecimals[currency];
  return utils.parseUnits(value, unit);
};
