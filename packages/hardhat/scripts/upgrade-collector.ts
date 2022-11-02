import { ethers } from 'hardhat';

export const upgradeCollector = async (
  proxyContractAddress: string,
  currentCollectorAddress: string,
  initializeArgs: any[]
) => {
  const proxyContract = await ethers.getContractAt(
    'ERC1967Proxy',
    proxyContractAddress
  );
  proxyContract;

  const currentCollectorContract = await ethers.getContractAt(
    'Collector',
    currentCollectorAddress
  );

  const collectorFactory = await ethers.getContractFactory('Collector');
  const encodedInitializeFunctionData =
    collectorFactory.interface.encodeFunctionData('initialize', initializeArgs);

  const { wait } = await currentCollectorContract.upgradeTo(
    encodedInitializeFunctionData
  );
  await wait();

  const collectorContractProxy = await ethers.getContractAt(
    'Collector',
    proxyContract.address
  );

  return collectorContractProxy;
};
