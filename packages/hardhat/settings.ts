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
      to: {
        default: '0x0...',
      },
    },
  },
  networks: {
    31337: {
      weth: '',
    },
  },
};

export default settings;
