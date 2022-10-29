import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';

const defaultRate = 10 * 100;
const defaultMin = 10e7;

describe('Collector', () => {
  let owner: SignerWithAddress;
  let stranger: SignerWithAddress;
  let collectorContract: Contract;

  before(async () => {
    [owner, stranger] = await ethers.getSigners();
  });

  const deploy = async (
    rate = defaultRate,
    min = defaultMin,
    to = owner.address
  ) => {
    const factory = await ethers.getContractFactory('Collector');
    collectorContract = await (await factory.deploy(rate, min, to)).deployed();
    return collectorContract;
  };

  describe('Constructor', () => {
    describe('constructor', () => {
      it('constructor', async () => {
        await deploy();
        const setFeeEvent = (await collectorContract.queryFilter('SetFee'))[0];
        const setPaymentToEvent = (
          await collectorContract.queryFilter('SetPaymentTo')
        )[0];
        expect(setFeeEvent.args?.rate).eq(defaultRate);
        expect(setFeeEvent.args?.min).eq(defaultMin);
        expect(setPaymentToEvent.args?.to).eq(owner.address);
      });

      it('Fee must be less than 10000.', async () => {
        const invalidRate = 10001;
        expect(deploy(invalidRate)).revertedWith('Collector: Invalid rate');
      });
    });
  });

  describe('Deployed', () => {
    beforeEach(async () => {
      await deploy();
    });

    describe('setFee', () => {
      it('setFee', async () => {
        const newRate = defaultRate + 10 * 100;
        const newMin = defaultMin + 10;
        const { wait } = await collectorContract.setFee(newRate, newMin);
        const tx = await wait();

        const setFeeEvent = tx.events[0];
        expect(setFeeEvent.args?.rate).eq(newRate);
        expect(setFeeEvent.args?.min).eq(newMin);

        expect(await collectorContract.rate()).eq(newRate);
        expect(await collectorContract.min()).eq(newMin);
      });

      it('Fee must be less than 10000.', async () => {
        const invalidRate = 10001;
        expect(collectorContract.setFee(invalidRate, defaultMin)).revertedWith(
          'Collector: Invalid rate'
        );
      });

      it('Only the owner can call it.', async () => {
        expect(
          collectorContract.connect(stranger).setFee(defaultRate, defaultMin)
        ).revertedWith('Ownable: caller is not the owner');
      });
    });

    describe('setPaymentTo', () => {
      it('setPaymentTo', async () => {
        const { wait } = await collectorContract.setPaymentTo(stranger.address);
        const tx = await wait();
        const setPaymentToEvent = tx.events[0];
        expect(setPaymentToEvent.args?.to).eq(stranger.address);
      });

      it('Only the owner can call it.', async () => {
        expect(
          collectorContract.connect(stranger).setPaymentTo(stranger.address)
        ).revertedWith('Ownable: caller is not the owner');
      });
    });

    describe('calculateFee', () => {
      it('If amount is larger than min, fee is applied.', async () => {
        const amount = 10e9;
        const fee = await collectorContract.calculateFee(amount);
        expect(fee.toNumber()).eq(amount * (defaultRate / 100));
      });

      it('If amount is smaller than min, min is applied.', async () => {
        const amount = defaultMin - 10e5;
        const fee = await collectorContract.calculateFee(amount);
        expect(fee.toNumber()).eq(defaultMin);
      });

      it('If amount is 0, fee is also 0.', async () => {
        const amount = 0;
        const fee = await collectorContract.calculateFee(amount);
        expect(fee.toNumber()).eq(amount);
      });
    });

    describe('payAFee', () => {
      const mintAmount = 10e9;

      let erc20Contract: Contract;

      const setup = async () => {
        const erc20Factory = await ethers.getContractFactory(
          'ERC20PresetMinterPauser'
        );
        erc20Contract = await (
          await erc20Factory.deploy('TEST_TOKEN', 'TEST')
        ).deployed();

        const { wait } = await collectorContract.setPaymentTo(stranger.address);
        await wait();
      };

      const mintAndApprove = async () => {
        const mintRes = await erc20Contract.mint(owner.address, mintAmount);
        await mintRes.wait();

        const approveRes = await erc20Contract.approve(
          collectorContract.address,
          mintAmount
        );
        await approveRes.wait();
      };

      beforeEach(async () => {
        await setup();
      });

      it('payAFee', async () => {
        await mintAndApprove();
        const { wait } = await collectorContract.payAFee(
          erc20Contract.address,
          mintAmount
        );
        const { events } = await wait();
        const event = events.filter(
          ({ event }: { event: string }) => event === 'PayAFee'
        )[0];

        expect(event.args.token).eq(erc20Contract.address);
        expect(event.args.from).eq(owner.address);
        expect(event.args.to).eq(stranger.address);

        expect(await erc20Contract.balanceOf(stranger.address)).eq(mintAmount);
      });

      it('If fee is 0, it is rejected.', async () => {
        expect(
          collectorContract.payAFee(erc20Contract.address, mintAmount)
        ).revertedWith('Collector: Amount is 0.');
      });
    });
  });
});
