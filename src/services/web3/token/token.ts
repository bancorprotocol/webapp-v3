import { web3 } from 'services/web3/index';
import { BigNumber } from 'ethers';
import { MultiCall, multicall } from 'services/web3/multicall/multicall';
import { ContractsApi } from 'services/web3/v3/contractsApi';

export const fetchTokenBalance = async (
  tokenId: string,
  user: string
): Promise<BigNumber> => {
  return await ContractsApi.Token(tokenId).read.balanceOf(user);
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
  const contract = ContractsApi.Token(address).read;

  return {
    contractAddress: contract.address,
    interface: contract.interface,
    methodName: 'balanceOf',
    methodParameters: [user],
  };
};

export const buildTokenTotalSupplyCall = (address: string): MultiCall => {
  const contract = ContractsApi.Token(address).read;

  return {
    contractAddress: contract.address,
    interface: contract.interface,
    methodName: 'totalSupply',
    methodParameters: [],
  };
};

export const fetchETH = async (user: string) =>
  (await web3.provider.getBalance(user)).toString();
