import { utils } from 'ethers';

import { Settings } from './@types/settings';

const settings: Settings<'weth'> = {
  contracts: {
    collector: {
      min: {
        weth: utils.parseEther('0.0005'), // 0.0005ETH
      },
      rate: {
        default: 3 * 100, // 3%
      },
      to: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
    },
  },
  networks: {
    31337: {
      weth: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    },
  },
};

export default settings;
