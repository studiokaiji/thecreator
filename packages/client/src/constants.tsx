export const currencies = ['USDC', 'WETH', 'MATIC'] as const;
export const currencyDecimals: { [key in typeof currencies[number]]: number } =
  {
    MATIC: 18,
    USDC: 6,
    WETH: 18,
  };
