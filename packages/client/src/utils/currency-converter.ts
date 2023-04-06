import { constants } from 'ethers';

import { currencies } from './../constants';

export const tokenAddressToCurrency = (tokenAddress: string) => {
  const currency =
    tokenAddress === import.meta.env.VITE_USDC_ADDRESS
      ? 'USDC'
      : tokenAddress === import.meta.env.VITE_WETH_ADDRESS
      ? 'WETH'
      : tokenAddress === constants.AddressZero
      ? 'MATIC'
      : null;

  if (currency === null) {
    throw Error('InvalidAdddress');
  }

  return currency;
};

export const currencyToTokenAddress = (currency: typeof currencies[number]) => {
  const tokenAddress =
    currency === 'USDC'
      ? import.meta.env.VITE_USDC_ADDRESS
      : currency === 'WETH'
      ? import.meta.env.VITE_WETH_ADDRESS
      : constants.AddressZero;
  return tokenAddress;
};
