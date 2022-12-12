import { task } from 'hardhat/config';
import '@nomiclabs/hardhat-ethers';

const NAME = 'TheCreator Test Token';
const SYMBOL = 'TCRE';
const MINT_AMOUNT = 10e9;

task('local-setup').setAction(async (_, { ethers, run }) => {
  console.log('Start local-setup');

  const erc20Factory = await ethers.getContractFactory(
    'ERC20PresetMinterPauser'
  );
  const erc20Contract = await (
    await erc20Factory.deploy(NAME, SYMBOL)
  ).deployed();

  console.log('ERC20PresetMinterPauser > deployed to:', erc20Contract.address);

  const [to] = await ethers.getSigners();

  const { wait } = await erc20Contract.mint(to.address, MINT_AMOUNT);
  await wait();

  console.log('ERC20PresetMinterPauser > minted erc20 Token to:', to.address);

  await run('deploy');

  const multicallFactory = await ethers.getContractFactory('Multicall');
  const multicallConract = await (await multicallFactory.deploy()).deployed();
  console.log('Multicall > deployed to:', multicallConract.address);

  console.log('End local-setup');
});
