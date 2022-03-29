import { Token__factory } from 'services/web3/abis/types';
import { web3 } from 'services/web3/index';
import { BigNumber } from 'ethers';
import { MultiCall, multicall } from 'services/web3/multicall/multicall';

export const fetchTokenSupply = async (
  tokenAddress: string,
  blockHeight?: number
) => {
  const contract = Token__factory.connect(tokenAddress, web3.provider);
  return contract.totalSupply({ blockTag: blockHeight });
};

export const fetchTokenBalance = async (
  tokenId: string,
  user: string
): Promise<BigNumber> => {
  const contract = Token__factory.connect(tokenId, web3.provider);
  return await contract.balanceOf(user);
};

export const fetchTokenBalanceMulticall = async (
  tokenIds: string[],
  user: string
): Promise<Map<string, string>> => {
  const calls = tokenIds.map((tokenId) => buildTokenBalanceCall(tokenId, user));
  const res = await multicall(calls);
  if (!res || !res.length) {
    throw new Error('Multicall Error while fetching token balances');
  }
  return new Map(
    res.map((bn, idx) => {
      const tokenId = tokenIds[idx];
      const balanceWei = bn && bn.length ? bn[0].toString() : '0';
      return [tokenId, balanceWei];
    })
  );
};

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
