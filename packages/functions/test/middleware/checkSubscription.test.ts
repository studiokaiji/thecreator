import { Multicall__factory, TheCreatorProduct__factory } from '@contracts';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import {
  deployContract,
  deployMockContract,
  MockContract,
  MockProvider,
} from 'ethereum-waffle';
import { BigNumber, constants, Contract, utils } from 'ethers';

import { checkSubscription } from '@/middleware/checkSubscription';
import type { Plan, Subscription } from '@/middleware/checkSubscription';

const { expect } = chai;
chai.use(chaiAsPromised);

describe('checkSubscription', () => {
  const provider = new MockProvider();
  const [wallet] = provider.getWallets();

  let productMockContract: MockContract;

  let defaultSubscription: Subscription;
  let defaultPlan: Plan;

  let multicallContract: Contract;

  before(async () => {
    defaultSubscription = {
      balance: utils.parseEther('100'),
      isValid: true,
      lastMintedAt: BigNumber.from(new Date(1980, 1, 1).getTime() * 1000),
      meta: 'META',
      nft: constants.AddressZero,
      planId: BigNumber.from(1),
      tokenId: BigNumber.from(1),
      usage: utils.parseEther('1'),
    };

    defaultPlan = {
      meta: 'META',
      nft: constants.AddressZero,
      usage: utils.parseEther('1'),
    };

    productMockContract = await deployMockContract(
      wallet,
      TheCreatorProduct__factory.abi
    );

    multicallContract = await deployContract(wallet, Multicall__factory, []);
  });

  beforeEach(async () => {
    await productMockContract.mock.subscriptions.returns(defaultSubscription);
    await productMockContract.mock.plans.returns(defaultPlan);
  });

  it('Check valid subscription', async () => {
    const [ok, { plan, subscription }] = await checkSubscription(
      wallet.address.toLocaleLowerCase(),
      productMockContract.address,
      defaultSubscription.planId,
      provider,
      multicallContract.address
    );

    expect(ok).true;
    expect(plan).exist;
    expect(subscription).exist;
  });

  it('Check invalid subscription', async () => {
    const invalidSubscription = { ...defaultSubscription, isValid: false };
    await productMockContract.mock.subscriptions.returns(invalidSubscription);

    const [ok, { plan, subscription }] = await checkSubscription(
      wallet.address.toLocaleLowerCase(),
      productMockContract.address,
      invalidSubscription.planId,
      provider,
      multicallContract.address
    );

    expect(ok).false;
    expect(plan).exist;
    expect(subscription).exist;
  });

  it('If process.env.MULTICALL_ADDRESS does not exist, multicallContractAddress is required.', () => {
    expect(
      checkSubscription(
        wallet.address.toLocaleLowerCase(),
        productMockContract.address,
        defaultSubscription.planId,
        provider
      )
    ).to.be.rejectedWith(
      'If process.env.MULTICALL_ADDRESS does not exist, multicallContractAddress is required.'
    );
  });

  it('If process.env.CHAIN_RPC_ENDPOINTS does not exist, provider is required.', () => {
    expect(
      checkSubscription(
        wallet.address.toLocaleLowerCase(),
        productMockContract.address,
        defaultSubscription.planId
      )
    ).to.be.rejectedWith('Need process.env.CHAIN_RPC_ENDPOINTS');
  });
});
