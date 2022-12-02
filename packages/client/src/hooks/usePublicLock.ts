import { PublicLockV11 } from '@unlock-protocol/contracts';
import {
  BigNumber,
  BigNumberish,
  constants,
  Contract,
  providers,
} from 'ethers';

import { useContract } from './useContract';
import { useWallet } from './useWallet';

import { ERC20 } from '@/abis';
import { rpcProvider } from '@/rpc-provider';
import { aggregate } from '@/utils/multicall';

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

export const usePublicLock = (address: string) => {
  const { account, library } = useWallet();

  const lock = useContract(address, PublicLockV11.abi);

  const purchase = async ({
    onApproved,
    onApproveTxSend,
    onPurchased,
    onPurchaseTxSend,
    requests = [],
    tokenAddress,
  }: PurchaseOpts) => {
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

    const args = validRequests.reduce<BigNumberish[][]>((prev, req, i) => {
      prev[i][0] = req.amount;
      prev[i][1] = req.to;
      prev[i][2] = req.udtReceiver;
      prev[i][3] = req.keyManager;
      prev[i][4] = [];
      return prev;
    }, []);

    let value = BigNumber.from(0);

    tokenAddress ??= await getPaymentTokenAddress();

    if (tokenAddress === constants.AddressZero) {
      // calculate value from amounts
      value = args.reduce<BigNumber>(
        (prev, n) => prev.add(BigNumber.from(n[0])),
        BigNumber.from(0)
      );
    } else {
      // ERC20
      const erc20 = new Contract(tokenAddress, ERC20, library);

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

  const getKeyPrice = (): Promise<BigNumber> => {
    return lock.keyPrice();
  };

  const getPaymentTokenAddress = (): Promise<string> => {
    return lock.tokenAddress();
  };

  const isValidKey = (tokenId: BigNumberish): Promise<BigNumber> => {
    return lock.isValidKey(tokenId);
  };

  const getToken = async (tokenId: BigNumberish) => {
    const inputs = [
      'isValidKey',
      'keyExpirationTimestampFor',
      'keyManagerOf',
      'ownerOf',
    ];

    const params = inputs.map((key) => {
      const callData = lock.interface.encodeFunctionData(key, [tokenId]);
      return { callData, target: address };
    });

    const { returnData } = await aggregate(params, library || rpcProvider);

    const res = inputs.map((key, i) => {
      const data = lock.interface.decodeFunctionResult(key, returnData[i])[0];
      return data as {
        isValidKey: boolean;
        keyExpirationTimestampFor: BigNumber;
        keyManagerOf: string;
        ownerOf: string;
      };
    });

    return res;
  };

  return {
    contract: lock,
    getKeyPrice,
    getPaymentTokenAddress,
    getToken,
    isValidKey,
    purchase,
  };
};
