import { web3 } from 'services/web3';
import { MultiCall } from 'services/web3/multicall/multicall';
import { Token__factory } from 'services/web3/abis/types';

export const buildTokenBalanceCall = (
  address: string,
  user: string
): MultiCall => {
  const contract = Token__factory.connect(address, web3.provider);

  return {
    contractAddress: contract.address,
    interface: contract.interface,
    methodName: 'balanceOf',
    methodParameters: [user],
  };
};

export const buildTokenTotalSupplyCall = (address: string): MultiCall => {
  const contract = Token__factory.connect(address, web3.provider);

  return {
    contractAddress: contract.address,
    interface: contract.interface,
    methodName: 'totalSupply',
    methodParameters: [],
  };
};

export const fetchETH = async (user: string) =>
  (await web3.provider.getBalance(user)).toString();
