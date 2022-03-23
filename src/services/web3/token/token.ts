import { Token__factory } from 'services/web3/abis/types';
import { web3 } from 'services/web3/index';
import { BigNumber } from 'ethers';
import { buildTokenBalanceCall } from 'services/observables/balances';
import { multicall } from 'services/web3/multicall/multicall';

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
