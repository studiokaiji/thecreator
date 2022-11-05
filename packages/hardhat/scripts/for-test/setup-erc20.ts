import { ethers } from 'hardhat';

const NAME = 'TheCreator Test Token';
const SYMBOL = 'TCRE';
const MINT_AMOUNT = 10e9;

export const setupTestERC20 = async () => {
  console.log('Start setupTestERC20');

  const factory = await ethers.getContractFactory('ERC20PresetMinterPauser');

  const beforeDeployedERC20 = await factory.deploy(NAME, SYMBOL);
  console.log(
    'ERC20PresetMinterPauser Deploying...',
    beforeDeployedERC20.deployTransaction.hash
  );

  const erc20Contract = await beforeDeployedERC20.deployed();
  console.log('ERC20PresetMinterPauser Deployed.', erc20Contract.address);

  const [mintTo] = await ethers.getSigners();
  const { wait } = await erc20Contract.mint(mintTo.address, MINT_AMOUNT);
  console.log('Minting to', mintTo.address);

  await wait();
  console.log('Minted');

  console.log('End setupTestERC20');
};

setupTestERC20().catch((e) => {
  console.error(e);
  process.exit(1);
});
