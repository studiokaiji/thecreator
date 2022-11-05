import type { BigNumberish } from 'ethers';
import { ethers, network } from 'hardhat';

import settings from '../settings';

const deploy = async () => {
  console.log('Start deploy');

  const chainId = network.config.chainId;

  if (
    !chainId ||
    !Object.keys(settings.networks).includes(chainId.toString())
  ) {
    throw Error('Invalid network.');
  }

  const { min, rate, to } = settings.contracts.collector;

  const collectorFactory = await ethers.getContractFactory('Collector');

  const beforeDeployedCollector = await collectorFactory.deploy();
  console.log(
    'Collector Deploying...',
    beforeDeployedCollector.deployTransaction.hash
  );

  const collectorContract = await beforeDeployedCollector.deployed();
  console.log('Collector Deployed.', collectorContract.address);

  const currencies = settings.networks[chainId];

  const [erc20s, rates, mins]: [string[], BigNumberish[], BigNumberish[]] = [
    [],
    [],
    [],
  ];
  (Object.keys(currencies) as (keyof typeof currencies)[]).forEach((c, i) => {
    erc20s[i] = currencies[c];

    const r = rate[c] || rate.default;
    if (!r || r > 10000) throw Error('Invalid rates.');
    rates[i] = r;

    const m = min[c] || min.default;
    if (!m) throw Error('Invalid min.');
    mins[i] = m;
  });

  const proxyFactory = await ethers.getContractFactory('ERC1967Proxy');
  const beforeDeployedProxy = await proxyFactory.deploy(
    collectorContract.address,
    collectorContract.interface.encodeFunctionData('initialize', [
      erc20s,
      rates,
      mins,
      to,
    ])
  );
  console.log(
    'ERC1967Proxy Deploying...',
    beforeDeployedProxy.deployTransaction.hash
  );

  const proxyContract = await beforeDeployedProxy.deployed();
  console.log('ERC1967Proxy Deployed.', proxyContract.address);

  const productFactoryFactory = await ethers.getContractFactory(
    'TheCreatorProductFactory'
  );
  const beforeDeployProductFactory = await productFactoryFactory.deploy();
  console.log(
    'TheCreatorProductFactory Deploying...',
    beforeDeployProductFactory.deployTransaction.hash
  );

  const productFactoryContract = await beforeDeployProductFactory.deployed();
  console.log(
    'TheCreatorProductFactory Deployed.',
    productFactoryContract.address
  );

  console.log('End deploy');
};

deploy().catch((e) => {
  console.error(e);
  process.exit(1);
});
