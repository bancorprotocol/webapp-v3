import { EthNetworks } from 'services/web3/types';
import { Token } from './tokens';
import { ethToken } from 'services/web3/config';
import { web3 } from 'services/web3';
import { partition } from 'lodash';
import { shrinkToken } from 'utils/formulas';
import { multicall } from 'services/web3/multicall/multicall';
import { Token__factory } from 'services/web3/abis/types';

interface TokenBalance {
  balance: string;
  address: string;
}

export const fetchTokenBalances = async (
  tokens: Token[],
  user: string,
  currentNetwork: EthNetworks
): Promise<Token[]> => {
  const [eth, tokensNoETH] = partition(
    tokens,
    (token) => token.address === ethToken
  );
  const calls = tokensNoETH.map((x) => buildTokenBalanceCall(x.address, user));

  try {
    const [tokenBalances, ethBalance]: [
      TokenBalance[] | undefined,
      string | undefined
    ] = await Promise.all([
      [{ balance: '', address: '' }], //multicall(currentNetwork, calls),
      eth && fetchETH(user),
    ]);

    if (tokenBalances && tokenBalances.length > 0) {
      const balances = tokenBalances.map((token) => {
        const inedx = tokensNoETH.findIndex((t) => t.address === token.address);
        return {
          ...tokensNoETH[inedx],
          balance: token.balance
            ? token.balance !== '0'
              ? shrinkToken(token.balance, tokensNoETH[inedx].decimals)
              : token.balance
            : null,
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
  } catch (e) {
    console.error('Failed fetching balances: ', e);
  }

  return [];
};

const buildTokenBalanceCall = (address: string, user: string) => {
  const contract = Token__factory.connect(address, web3);

  return {
    contractAddress: contract.address,
    interface: contract.interface,
    methodName: contract.balanceOf.toString(),
    methodParameters: [user],
  };
};

const fetchETH = async (user: string) =>
  shrinkToken(await web3.getBalance(user).toString(), 18);
