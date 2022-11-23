import { initializeMeltApp } from '@studiokaiji/meltjs';

export const useMeltApp = () => {
  const meltApp = initializeMeltApp({
    ethereum: (window as any)['ethereum'],
    provider: {
      url: import.meta.env.VITE_RPC_ENDPOINT_URL,
    },
  });
  return meltApp;
};
