import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BigNumber, constants, Contract } from 'ethers';
import { ethers } from 'hardhat';

const percentageRate = 10;
const rate = percentageRate * 100;
const min = 10e7;

const productName = 'Product';
const productSymbol = 'PROD';

const mintAmount = 10e7;

const planUsage = 1000;

describe('TheCreatorProduct', () => {
  let owner: SignerWithAddress;
  let feeReceiver: SignerWithAddress;
  let collectorContract: Contract;
  let erc20Contract: Contract;
  let productContract: Contract;
  let erc1155MitableOnlyOwnerContract: Contract;

  before(async () => {
    [owner, feeReceiver] = await ethers.getSigners();
    await deployERC20Contract();
    await deployCollectorContract();
  });

  const deployCollectorContract = async () => {
    const factory = await ethers.getContractFactory('Collector');
    collectorContract = await (
      await factory.deploy(rate, min, feeReceiver.address)
    ).deployed();
    return collectorContract;
  };

  const deployERC20Contract = async () => {
    const factory = await ethers.getContractFactory('ERC20PresetMinterPauser');
    erc20Contract = await (
      await factory.deploy('TEST_TOKEN', 'TEST')
    ).deployed();
    return erc20Contract;
  };

  const mintERC20Token = async (
    to: string = owner.address,
    amount = mintAmount
  ) => {
    const mintRes = await erc20Contract.mint(to, amount);
    await mintRes.wait();
  };

  const mintAndApproveERC20Token = async (
    to: string = owner.address,
    amount = mintAmount,
    spender: string = productContract.address
  ) => {
    await mintERC20Token(to, amount);
    const approveRes = await erc20Contract.approve(spender, amount);
    await approveRes.wait();
  };

  const deployProductContract = async () => {
    const factory = await ethers.getContractFactory('TheCreatorProduct');
    productContract = await (
      await factory.deploy(
        productName,
        productSymbol,
        erc20Contract.address,
        collectorContract.address,
        constants.AddressZero
      )
    ).deployed();
    return productContract;
  };

  const deployERC1155MitableOnlyOwnerContract = async () => {
    const factory = await ethers.getContractFactory(
      'ERC1155MintableOnlyOwnerIncremental'
    );
    erc1155MitableOnlyOwnerContract = await (
      await factory.deploy('', constants.AddressZero)
    ).deployed();
    return erc1155MitableOnlyOwnerContract;
  };

  describe('Before deploy', () => {
    describe('constructor', () => {
      it('constructor', async () => {
        const contract = await deployProductContract();
        expect(await contract.name()).eq(productName);
        expect(await contract.symbol()).eq(productSymbol);
        expect(await contract.baseToken()).eq(erc20Contract.address);
      });
    });
  });

  describe('After deploy', () => {
    beforeEach(async () => {
      await deployProductContract();
    });

    describe('withdraw', () => {
      it('withdraw', async () => {
        await mintERC20Token(productContract.address);
        const { wait } = await productContract.withdraw();
        const { events } = await wait();
        const { args } = events.filter(
          ({ event }: { event: string }) => event === 'Withdraw'
        )[0];
        expect(args.amount.toNumber()).eq(
          mintAmount * ((100 - percentageRate) / 100)
        );
      });

      it('If Balance is 0, error is returned.', async () => {
        expect(productContract.withdraw()).revertedWith(
          'TheCreatorProduct: No balance'
        );
      });
    });

    let planId: BigNumber;

    const addPlan = async (usage = planUsage) => {
      const { wait } = await productContract.addPlan(
        usage,
        erc1155MitableOnlyOwnerContract.address,
        new Uint8Array()
      );
      const { events } = await wait();
      const { args } = events.filter(
        ({ event }: { event: string }) => event === 'PlanAddSingle'
      )[0];

      planId = args.planId;
      return planId;
    };

    let erc1155TokenId: BigNumber;

    const mintAndApproveERC1155 = async (to = owner.address) => {
      const mintRes = await erc1155MitableOnlyOwnerContract.mint(
        to,
        new Uint8Array()
      );
      const { events } = await mintRes.wait();
      const { args } = events.filter(
        ({ event }: { event: string }) => event === 'TransferSingle'
      )[0];

      erc1155TokenId = args.id;

      const approvalRes =
        await erc1155MitableOnlyOwnerContract.setApprovalForAll(
          productContract.address,
          true
        );
      await approvalRes.wait();

      return erc1155TokenId;
    };

    const setupForSubscribe = async (approveTo = owner.address) => {
      await deployERC1155MitableOnlyOwnerContract();
      await addPlan();
      await mintAndApproveERC1155(approveTo);
    };

    describe('subscribe', () => {
      const mintAndApproveAndDepositERC20Token = async (
        amount = mintAmount
      ) => {
        await mintAndApproveERC20Token(owner.address, amount);
        await productContract.deposit(owner.address, amount);
      };

      beforeEach(async () => {
        await setupForSubscribe();
      });

      it('subscribe', async () => {
        await mintAndApproveAndDepositERC20Token();

        const { wait } = await productContract.subscribe(
          planId,
          erc1155TokenId
        );
        await wait();

        const customerData = await productContract.customers(owner.address);
        expect(customerData.planId.eq(planId)).true;
      });

      it("The balance must be at least one month's worth of the plan you want to subscribe to.", async () => {
        await mintAndApproveAndDepositERC20Token(planUsage);

        expect(productContract.subscribe(planId, erc1155TokenId)).revertedWith(
          'TheCreatorProduct: Amount is low'
        );
      });
    });

    describe('subscribeAndDeposit', () => {
      beforeEach(async () => {
        await setupForSubscribe();
      });

      it('subscribeAndDeposit', async () => {
        await mintAndApproveERC20Token();

        const { wait } = await productContract.subscribeAndDeposit(
          planId,
          erc1155TokenId,
          mintAmount
        );
        await wait();

        const customerData = await productContract.customers(owner.address);
        expect(customerData.planId.eq(planId)).true;
      });

      it("The balance must be at least one month's worth of the plan you want to subscribe to.", async () => {
        await mintAndApproveERC20Token(owner.address, planUsage);
        expect(
          productContract.subscribe(planId, erc1155TokenId, planUsage)
        ).revertedWith('TheCreatorProduct: Amount is low');
      });
    });

    describe('subscribeAndDepositAfterTransferOfNFT', () => {
      beforeEach(async () => {
        await setupForSubscribe(productContract.address);
      });

      it('subscribeAndDepositAfterTransferOfNFT', async () => {
        await mintAndApproveERC20Token();

        const { wait } =
          await productContract.subscribeAndDepositAfterTransferOfNFT(
            planId,
            erc1155TokenId,
            mintAmount
          );
        await wait();

        const customerData = await productContract.customers(owner.address);
        expect(customerData.planId.eq(planId)).true;
      });

      it("The balance must be at least one month's worth of the plan you want to subscribe to.", async () => {
        await mintAndApproveERC20Token(owner.address, planUsage);
        expect(
          productContract.subscribeAndDepositAfterTransferOfNFT(
            planId,
            erc1155TokenId,
            planUsage
          )
        ).revertedWith('TheCreatorProduct: Amount is low');
      });
    });
  });
});
