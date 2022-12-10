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
  const { contract, switchChain } = useContract(address, PublicLockV11.abi);

  const { account, library } = useWallet();

  const switchChainOnlySigner = async () => {
    if (!contract.signer) return contract;
    return switchChain();
  };

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

    const lock = await switchChainOnlySigner();

    if (requests.length < 1) {
      requests.push({});
    }

    let keyPrice: BigNumber | null = null;

    const validRequests = await Promise.all(
      requests.map(async (req) => {
        if (!req.amount) {
          if (!keyPrice) {
            keyPrice = await getKeyPrice();
            console.log(keyPrice);
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
        prev[0][i] = req.amount;
        prev[1][i] = req.to;
        prev[2][i] = req.udtReceiver;
        prev[3][i] = req.keyManager;
        // prev[4][i] = [];
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
    const lock = await switchChainOnlySigner();
    return lock.keyPrice();
  };

  const getPaymentTokenAddress = async (): Promise<string> => {
    const lock = await switchChainOnlySigner();
    return lock.tokenAddress();
  };

  const isValidKey = async (tokenId: BigNumberish): Promise<BigNumber> => {
    const lock = await switchChainOnlySigner();
    return lock.isValidKey(tokenId);
  };

  const getToken = async (tokenId: BigNumberish) => {
    const lock = await switchChainOnlySigner();

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
    contract,
    getKeyPrice,
    getPaymentTokenAddress,
    getToken,
    isValidKey,
    purchase,
  };
};
