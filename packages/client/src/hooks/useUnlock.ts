import { PublicLockV11, UnlockV11 } from '@unlock-protocol/contracts';
import { BigNumberish, constants, Contract, providers, utils } from 'ethers';

import { useContract } from './useContract';
import { useWallet } from './useWallet';

type CreateLockReq = {
  lockCreator?: string;
  baseToken?: string;
  expirationDurationSeconds?: BigNumberish;
  maxNumberOfKeys?: BigNumberish;
  price: BigNumberish;
  lockName: string;
};

type CreateLockOpts = {
  request: CreateLockReq;
  onCreateLockTxSend?: (response: providers.TransactionResponse) => void;
  onCreateLockEnded?: (receipt: providers.TransactionReceipt) => void;
};

const VERSION = 11;

export const useUnlock = (address = import.meta.env.VITE_UNLOCK_ADDRESS) => {
  const unlock = useContract(address, UnlockV11.abi);

  const { account, library } = useWallet();

  const createLock = async ({
    onCreateLockEnded,
    onCreateLockTxSend,
    request: {
      baseToken = constants.AddressZero,
      expirationDurationSeconds = 30 * 60 * 60 * 24,
      lockCreator = account,
      lockName,
      maxNumberOfKeys = constants.MaxUint256,
      price,
    },
  }: CreateLockOpts) => {
    const iface = new utils.Interface(PublicLockV11.abi);
    const params = iface.encodeFunctionData(
      'initialize(address,uint256,address,uint256,uint256,string)',
      [
        lockCreator,
        expirationDurationSeconds,
        baseToken,
        price,
        maxNumberOfKeys,
        lockName,
      ]
    );

    const tx = unlock.createUpgradeableLockAtVersion(params, VERSION);
    onCreateLockTxSend && onCreateLockTxSend(tx);

    const receipt = await tx.wait();
    onCreateLockEnded && onCreateLockEnded(receipt);

    const lockAddress = receipt.logs[0].address;
    const lock = new Contract(lockAddress, PublicLockV11.abi, library);

    return lock;
  };

  return { contract: unlock, createLock };
};
