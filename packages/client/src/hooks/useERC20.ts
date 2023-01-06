import { BigNumber, BigNumberish, providers } from 'ethers';

import { useContract } from './useContract';
import { useWallet } from './useWallet';

import { ERC20 } from '@/abis';

export const useERC20 = (address: string) => {
  const { library } = useWallet();
  const { contract } = useContract(address, ERC20, library);

  const getName = (): Promise<string> => contract.name();
  const getSymbol = (): Promise<string> => contract.symbol();
  const getDecimals = (): Promise<BigNumber> => contract.decimals();
  const getTotalSupply = (): Promise<BigNumber> => contract.totalSupply();
  const balanceOf = (account: string): Promise<BigNumber> =>
    contract.balanceOf(account);
  const transfer = (to: string, value: BigNumberish) =>
    contract.transfer(to, value) as Promise<providers.TransactionResponse>;
  const transferFrom = (from: string, address: string, value: BigNumberish) =>
    contract.tranferFrom(
      from,
      address,
      value
    ) as Promise<providers.TransactionResponse>;
  const approve = (to: string, value: BigNumberish) =>
    contract.approve(to, value) as Promise<providers.TransactionResponse>;
  const allowance = (account: string, spender: string) =>
    contract.allowance(
      account,
      spender
    ) as Promise<providers.TransactionResponse>;

  return {
    allowance,
    approve,
    balanceOf,
    contract,
    getDecimals,
    getName,
    getSymbol,
    getTotalSupply,
    transfer,
    transferFrom,
  };
};
