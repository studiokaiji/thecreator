import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { constants, Contract } from 'ethers';
import { ethers } from 'hardhat';

const trustedForwarderAddress = constants.AddressZero;
const erc20Address = constants.AddressZero;
const name = 'Product';
const symbol = 'PROD';

describe('TheCreatorProductFactory', () => {
  let owner: SignerWithAddress;

  let collectorContract: Contract;
  let productFactoryContract: Contract;

  before(async () => {
    [owner] = await ethers.getSigners();
  });

  const deployProductFactory = async () => {
    const collectorFactory = await ethers.getContractFactory('Collector');
    collectorContract = await (await collectorFactory.deploy()).deployed();

    const productFactoryFactory = await ethers.getContractFactory(
      'TheCreatorProductFactory'
    );
    productFactoryContract = await (
      await productFactoryFactory.deploy(
        collectorContract.address,
        trustedForwarderAddress
      )
    ).deployed();

    return productFactoryContract;
  };

  describe('constructor', () => {
    it('constructor', async () => {
      await deployProductFactory();
    });
  });

  describe('create', () => {
    beforeEach(async () => {
      await deployProductFactory();
    });

    it('create', async () => {
      const { wait } = await productFactoryContract.create(
        name,
        symbol,
        erc20Address
      );
      const { events } = await wait();
      const { args } = events.filter(
        ({ event }: { event: string }) => event === 'Deployed'
      )[0];
      expect(args.from).eq(owner.address);

      const productContract = await ethers.getContractAt(
        'TheCreatorProduct',
        args.product
      );
      expect(await productContract.name()).eq(name);
      expect(await productContract.symbol()).eq(symbol);
      expect(await productContract.baseToken()).eq(erc20Address);
    });
  });
});
