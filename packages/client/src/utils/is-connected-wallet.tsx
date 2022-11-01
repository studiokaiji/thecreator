export const isConnectedWallet = async (
  address = '',
  ethereum = (window as any).ethereum
) => {
  address = address.toLocaleLowerCase();
  const accounts = await ethereum.request({ method: 'eth_accounts' });

  console.log(address, accounts);

  if (accounts.length === 0) {
    return false;
  }
  if (address && accounts[0].toLocaleLowerCase() !== address) {
    return false;
  }
  return true;
};
