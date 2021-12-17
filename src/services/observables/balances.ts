import { Token } from './tokens';
import { ethToken } from 'services/web3/config';
import { web3 } from 'services/web3';
import { partition } from 'lodash';
import { shrinkToken } from 'utils/formulas';
import { MultiCall, multicall } from 'services/web3/multicall/multicall';
import { Token__factory } from 'services/web3/abis/types';
import { Result } from '@ethersproject/abi/lib/coders/abstract-coder';
import BigNumber from 'bignumber.js';

export const fetchTokenBalances = async (
  tokens: Token[],
  user: string
): Promise<Token[]> => {
  const [eth, tokensNoETH] = partition(
    tokens,
    (token) => token.address === ethToken
  );

  const calls = tokensNoETH.map((x) => buildTokenBalanceCall(x.address, user));

  try {
    const [tokenBalances, ethBalance]: [
      Result[] | undefined,
      string | undefined
    ] = await Promise.all([multicall(calls), eth && fetchETH(user)]);
    if (tokenBalances) {
      const balances = tokenBalances.map((bn, index) => {
        const balance = bn.length > 0 ? (bn[0] as BigNumber).toString() : '0';
        return {
          ...tokensNoETH[index],
          balance:
            balance !== '0'
              ? shrinkToken(balance, tokensNoETH[index].decimals)
              : balance,
        };
      });

      if (eth) {
        const ethIndex = tokens.findIndex((x) => x.address === ethToken);
        balances.splice(ethIndex, 0, {
          ...tokens[ethIndex],
          balance: ethBalance,
        });
      }

      return balances;
    }
  } catch (e: any) {
    console.error('Failed fetching balances: ', e);
  }

  return [];
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

const fetchETH = async (user: string) =>
  shrinkToken((await web3.provider.getBalance(user)).toString(), 18);
