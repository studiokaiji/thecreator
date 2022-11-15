import { TheCreatorProduct__factory } from '@contracts/index';
import { waffleChai } from '@ethereum-waffle/chai';
import {
  deployMockContract,
  MockContract,
} from '@ethereum-waffle/mock-contract';
import { MockProvider } from '@ethereum-waffle/provider';
import { expect, use } from 'chai';
import { BigNumber, constants, utils } from 'ethers';

import {
  checkSubscription,
  CheckSubscriptionContext,
  Subscription,
} from '#/middleware/checkSubscription';

const PORT = 18545;
const USAGE = 100;

use(waffleChai);

const getSubscription = (isValid = true, usage = USAGE): Subscription => ({
  balance: utils.parseEther('0.1'),
  isValid,
  lastMintedAt: BigNumber.from(0),
  meta: '',
  nft: constants.AddressZero,
  planId: BigNumber.from(1),
  tokenId: BigNumber.from(1),
  usage: BigNumber.from(usage),
});

describe('checkSubscription', () => {
  const context = {
    env: { CHAIN_RPC_ENDPOINTS: [`http://127.0.0.1:${PORT}`] },
  } as unknown as CheckSubscriptionContext;

  const provider = new MockProvider({
    ganacheOptions: {
      port: PORT,
    },
  });

  const [signer] = provider.getWallets();

  let productContractMock: MockContract;
  before(async () => {
    productContractMock = await deployMockContract(
      signer,
      TheCreatorProduct__factory.abi
    );
    console.log(await provider.getNetwork());
  });

  it('True is returned if the specified usage is less than or equal to the usage of the plan to which the user is subscribed.', async () => {
    await productContractMock.mock.subscriptions.returns(getSubscription());
    expect(
      await checkSubscription(
        context,
        signer.address,
        productContractMock.address,
        USAGE
      )
    ).true;
    expect(
      await checkSubscription(
        context,
        signer.address,
        productContractMock.address,
        USAGE - 1
      )
    ).true;
  });

  it('False is returned if the usage specified exceeds the usage of the plan to which the user is subscribed.', async () => {
    await productContractMock.mock.subscriptions.returns(getSubscription());
    expect(
      await checkSubscription(
        context,
        signer.address,
        productContractMock.address,
        USAGE + 1
      )
    ).false;
  });

  it('If isValid is false, false is returned.', async () => {
    await productContractMock.mock.subscriptions.returns(
      getSubscription(false)
    );
    expect(
      await checkSubscription(
        context,
        signer.address,
        productContractMock.address,
        USAGE
      )
    ).false;
  });
});
