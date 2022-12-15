import { PublicLockV11 } from '@unlock-protocol/contracts';
import {
  BigNumber,
  BigNumberish,
  constants,
  Contract,
  providers,
} from 'ethers';

import { useContract } from './useContract';
import { useOnlyValidNetwork } from './useOnlyValidNetwork';
import { useWallet } from './useWallet';

import { ERC20 } from '@/abis';

type PurchaseReq = {
  amount: BigNumberish;
  to: string;
  udtReceiver: string;
  keyManager: string;
};

type PurchaseOpts = Partial<{
  tokenAddress: string;
  requests: Partial<PurchaseReq>[];
  onApproveTxSend: (response: providers.TransactionResponse) => void;
  onApproved: (receipt: providers.TransactionReceipt) => void;
  onPurchaseTxSend: (response: providers.TransactionResponse) => void;
  onPurchased: (receipt: providers.TransactionReceipt) => void;
}>;

export type UpdateOpts<T = unknown> = Partial<{
  onTxSend: (response: providers.TransactionResponse) => void;
  onTxConfirmed: (receipt: providers.TransactionReceipt) => void;
}> & { value: T };

export const usePublicLock = (address = constants.AddressZero) => {
  const { contract: lock } = useContract(address, PublicLockV11.abi);

  const { account, library } = useWallet();

  useOnlyValidNetwork();

  const purchase = async ({
    onApproved,
    onApproveTxSend,
    onPurchased,
    onPurchaseTxSend,
    requests = [],
    tokenAddress,
  }: PurchaseOpts = {}) => {
    if (!account || !library) {
      return;
    }

    if (requests.length < 1) {
      requests.push({});
    }

    let keyPrice: BigNumber | null = null;

    const validRequests = await Promise.all(
      requests.map(async (req) => {
        if (!req.amount) {
          if (!keyPrice) {
            keyPrice = await getKeyPrice();
          }
          req.amount = keyPrice;
        }

        req.keyManager ??= constants.AddressZero;
        req.to ??= account;
        req.udtReceiver ??= account; // Fix to thecreator address.

        return req as PurchaseReq;
      })
    );

    const args = validRequests.reduce<BigNumberish[][]>(
      (prev, req, i) => {
        prev[0][i] = BigNumber.from(req.amount);
        prev[1][i] = req.to;
        prev[2][i] = req.udtReceiver;
        prev[3][i] = req.keyManager;
        prev[4][i] = [];
        return prev;
      },
      [[], [], [], [], []]
    );

    let value = BigNumber.from(0);

    tokenAddress ??= await getPaymentTokenAddress();

    value = args[0].reduce<BigNumber>((prev, n) => {
      if (n) prev = prev.add(n);
      return prev;
    }, BigNumber.from(0));

    if (tokenAddress !== constants.AddressZero) {
      const erc20 = new Contract(tokenAddress, ERC20, library?.getSigner());

      const approveRes = await erc20.approve(address, value);
      onApproveTxSend && onApproveTxSend(approveRes);

      const approveReceipt = await approveRes.wait();
      onApproved && onApproved(approveReceipt);
    }

    const purchaseRes = await lock.purchase(...args, { value });
    onPurchaseTxSend && onPurchaseTxSend(purchaseRes);

    const purchaseReceipt = await purchaseRes.wait();
    onPurchased && onPurchased(purchaseReceipt);

    return purchaseReceipt;
  };

  const getKeyPrice = async (): Promise<BigNumber> => {
    return lock.keyPrice();
  };

  const getPaymentTokenAddress = async (): Promise<string> => {
    return lock.tokenAddress();
  };

  const isValidKey = async (tokenId: BigNumberish): Promise<BigNumber> => {
    return lock.isValidKey(tokenId);
  };

  const updateKeyPricing = async ({
    onTxConfirmed,
    onTxSend,
    value: { keyPrice, tokenAddress },
  }: UpdateOpts<{ keyPrice: BigNumberish; tokenAddress: string }>) => {
    const res = await lock.updateKeyPricing(keyPrice, tokenAddress);
    onTxSend && onTxSend(res);

    const receipt = await res.wait();
    onTxConfirmed && onTxConfirmed(receipt);
  };

  const updateMaxNumberOfKeys = async ({
    onTxConfirmed,
    onTxSend,
    value,
  }: UpdateOpts<BigNumberish>) => {
    const res = await lock.setMaxNumberOfKeys(value);
    onTxSend && onTxSend(res);

    const receipt = await res.wait();
    onTxConfirmed && onTxConfirmed(receipt);
  };

  return {
    contract: lock,
    getKeyPrice,
    getPaymentTokenAddress,
    isValidKey,
    purchase,
    updateKeyPricing,
    updateMaxNumberOfKeys,
  };
};
