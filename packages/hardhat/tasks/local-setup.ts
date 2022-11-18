import { constants } from 'ethers';
import { task } from 'hardhat/config';
import '@nomiclabs/hardhat-ethers';

const NAME = 'TheCreator Test Token';
const SYMBOL = 'TCRE';
const MINT_AMOUNT = 10e9;

const RATES = [10];
const MINS = [10000];

task('local-setup').setAction(async (_, { ethers }) => {
  console.log('Start local-setup');

  const erc20Factory = await ethers.getContractFactory(
    'ERC20PresetMinterPauser'
  );
  const erc20Contract = await (
    await erc20Factory.deploy(NAME, SYMBOL)
  ).deployed();

  console.log('ERC20PresetMinterPauser Deployed.', erc20Contract.address);

  const [to] = await ethers.getSigners();

  const { wait } = await erc20Contract.mint(to.address, MINT_AMOUNT);
  await wait();

  console.log('Minted to', to.address);

  const collectorFactory = await ethers.getContractFactory('Collector');
  const collectorContract = await (await collectorFactory.deploy()).deployed();

  console.log('Collector Deployed.', collectorContract.address);

  const proxyFactory = await ethers.getContractFactory('ERC1967Proxy');
  const proxyContract = await (
    await proxyFactory.deploy(
      collectorContract.address,
      collectorContract.interface.encodeFunctionData('initialize', [
        [erc20Contract.address],
        RATES,
        MINS,
        to.address,
      ])
    )
  ).deployed();

  console.log('ERC1967Proxy Deployed.', proxyContract.address);

  const productFactoryContract = await (
    await (
      await ethers.getContractFactory('TheCreatorProductFactory')
    ).deploy(proxyContract.address, constants.AddressZero)
  ).deployed();

  console.log(
    'TheCreatorProductFactory Deployed.',
    productFactoryContract.address
  );

  const multicallContract = await (
    await (await ethers.getContractFactory('Multicall')).deploy()
  ).deployed();

  console.log('Multicall Deployed.', multicallContract.address);

  console.log('End local-setup');
});
