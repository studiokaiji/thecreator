import { HardhatUserConfig } from 'hardhat/config';
import '@typechain/hardhat';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import './tasks/deploy';
import './tasks/local-setup';

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        settings: {
          optimizer: {
            enabled: true,
            runs: 50,
          },
        },
        version: '0.8.13',
      },
    ],
  },
  typechain: {
    outDir: './typechain-types',
    target: 'ethers-v5', // defaults to false
  },
};

export default config;
