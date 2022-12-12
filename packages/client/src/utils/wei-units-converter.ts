import { BigNumberish, utils } from 'ethers';

import { currencies, currencyDecimals } from '@/constants';

export const formatWeiUnits = (
  wei: BigNumberish,
  currency: typeof currencies[number]
) => {
  const unit = currencyDecimals[currency];
  return utils.formatUnits(wei, unit);
};

export const parseWeiUnits = (
  value: string,
  currency: typeof currencies[number]
) => {
  const unit = currencyDecimals[currency];
  return utils.parseUnits(value, unit);
};
