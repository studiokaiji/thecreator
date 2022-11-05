import type { BigNumberish } from 'ethers';

type CurrencyAndDefault<T extends string, U> = {
  [key in T | 'default']?: U;
};

export type Settings<T extends string> = {
  contracts: {
    collector: {
      min: CurrencyAndDefault<T, BigNumberish>;
      rate: CurrencyAndDefault<T, BigNumberish>;
      to: CurrencyAndDefault<T, string>;
    };
    productFactory?: {
      collector?: CurrencyAndDefault<T, 'string'>;
      forwarder?: CurrencyAndDefault<T, 'string'>;
    };
  };
  networks: {
    [chainId in number]: { [tokenName in T]: string };
  };
};
