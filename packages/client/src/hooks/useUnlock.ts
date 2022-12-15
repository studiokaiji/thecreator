import { PublicLockV11, UnlockV11 } from '@unlock-protocol/contracts';
import { BigNumberish, constants, Contract, providers, utils } from 'ethers';

import { useContract } from './useContract';
import { useWallet } from './useWallet';

type CreateLockReq = {
  lockCreator?: string;
  tokenAddress?: string;
  expirationDurationSeconds?: BigNumberish;
  maxNumberOfKeys?: BigNumberish;
  price: BigNumberish;
  lockName: string;
};

export type CreateLockOpts = {
  request: CreateLockReq;
  onCreateLockTxSend?: (response: providers.TransactionResponse) => void;
  onCreateLockEnded?: (receipt: providers.TransactionReceipt) => void;
  onFailedToTxSend?: (error: any) => void;
  onUserRejected?: () => void;
};

const VERSION = 11;

export const useUnlock = (address = import.meta.env.VITE_UNLOCK_ADDRESS) => {
  const { contract, switchChain } = useContract(address, UnlockV11.abi);

  const { account, library } = useWallet();

  const createLock = async ({
    onCreateLockEnded,
    onCreateLockTxSend,
    onFailedToTxSend,
    onUserRejected,
    request: {
      expirationDurationSeconds = 30 * 60 * 60 * 24,
      lockCreator = account,
      lockName,
      maxNumberOfKeys = constants.MaxUint256,
      price,
      tokenAddress = constants.AddressZero,
    },
  }: CreateLockOpts) => {
    const iface = new utils.Interface(PublicLockV11.abi);
    const params = iface.encodeFunctionData(
      'initialize(address,uint256,address,uint256,uint256,string)',
      [
        lockCreator,
        expirationDurationSeconds,
        tokenAddress,
        price,
        maxNumberOfKeys,
        lockName,
      ]
    );

    const unlock = await switchChain();

    const tx = await unlock
      .createUpgradeableLockAtVersion(params, VERSION)
      .catch((e: any) => {
        if (e.code === 4001) {
          onUserRejected && onUserRejected();
        } else {
          onFailedToTxSend && onFailedToTxSend(e);
        }
        throw e;
      });
    onCreateLockTxSend && onCreateLockTxSend(tx);

    const receipt = await tx.wait();
    onCreateLockEnded && onCreateLockEnded(receipt);

    const lockAddress = receipt.logs[0].address;
    const lock = new Contract(lockAddress, PublicLockV11.abi, library);

    return lock;
  };

  return { contract, createLock };
};
