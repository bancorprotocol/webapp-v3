import { web3 } from 'services/web3/index';
import { MultiCall, multicall } from 'services/web3/multicall/multicall';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { ethToken } from 'services/web3/config';

export const fetchTokenBalanceMulticall = async (
  tokenIds: string[],
  user: string
): Promise<Map<string, string>> => {
  const idsWithoutEth = tokenIds.filter((id) => id !== ethToken);
  const calls = idsWithoutEth.map((id) => buildTokenBalanceCall(id, user));

  const [res, eth] = await Promise.all([multicall(calls), fetchETH(user)]);

  if (!res || !res.length) {
    throw new Error('Multicall Error while fetching token balances');
  }
  const balanceMap = new Map(
    res.map((bn, idx) => {
      const tokenId = idsWithoutEth[idx];
      const balanceWei = bn && bn.length ? bn[0].toString() : '0';
      return [tokenId, balanceWei];
    })
  );
  balanceMap.set(ethToken, eth);

  return balanceMap;
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
