import type { BigNumberish } from 'ethers';
import { ethers } from 'hardhat';

export const deployCollector = async (
  rate: BigNumberish,
  min: BigNumberish,
  to: string
) => {
  const collectorFactory = await ethers.getContractFactory('Collector');
  const collectorContract = await (await collectorFactory.deploy()).deployed();

  const proxyFactory = await ethers.getContractFactory('ERC1967Proxy');
  const proxyContract = await (
    await proxyFactory.deploy(
      collectorContract.address,
      collectorContract.interface.encodeFunctionData('initialize', [
        rate,
        min,
        to,
      ])
    )
  ).deployed();

  const collectorContractProxy = await ethers.getContractAt(
    'Collector',
    proxyContract.address
  );

  return collectorContractProxy;
};

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
