import { findOrThrow, shrinkToken } from 'utils/pureFunctions';
import { partition } from 'lodash';
import {
  slimBalanceShape,
  balanceShape,
  multi,
} from 'services/web3/contracts/shapes';
import { EthNetworks } from 'services/web3/types';
import { Token } from './tokens';
import { ethToken } from 'services/web3/config';
import { web3 } from 'services/web3/contracts';
import { toChecksumAddress } from 'web3-utils';

interface RawBalance {
  contract: string;
  decimals: number;
  balance: string;
}

interface RawToken {
  contract: string;
  decimals?: number;
}

const toRawToken = (token: Token): RawToken => ({
  contract: token.address,
  ...(token.decimals && { decimals: token.decimals }),
});

export const fetchTokenBalances = async (
  tokens: RawToken[],
  user: string,
  currentNetwork: EthNetworks
): Promise<RawBalance[]> => {
  const [knownPrecisions, unknownPrecisions] = partition(
    tokens,
    (token) => Object.keys(token).includes('decimals') && token.decimals !== 0
  );

  const knownDecimalShapes = knownPrecisions.map((token) =>
    slimBalanceShape(token.contract, user)
  );
  const unknownDecimalShapes = unknownPrecisions.map((token) =>
    balanceShape(token.contract, user)
  );

  try {
    const [knownDecimalsRes, unknownDecimalsRes] = (await multi({
      groupsOfShapes: [knownDecimalShapes, unknownDecimalShapes],
      currentNetwork,
    })) as [
      { contract: string; balance: string }[],
      { contract: string; balance: string; decimals: string }[]
    ];

    const rebuiltDecimals = knownDecimalsRes.map((token): RawBalance => {
      const previouslyKnownPrecision = findOrThrow(
        knownPrecisions,
        (t) => token.contract === t.contract
      );
      return {
        ...token,
        decimals: previouslyKnownPrecision.decimals!,
      };
    });

    const parsedNumbers = unknownDecimalsRes.map(
      (res): RawBalance => ({
        ...res,
        decimals: Number(res.decimals),
      })
    );
    const mergedWei = [...rebuiltDecimals, ...parsedNumbers].map((token) => ({
      ...token,
      contract: toChecksumAddress(token.contract),
    }));
    return mergedWei;
  } catch (e) {
    console.error('Failed fetching balances');
  }

  return [];
};

export const updateTokenBalances = async (
  tokens: Token[],
  user: string,
  currentNetwork: EthNetworks
): Promise<Token[]> => {
  const includesEth = tokens.some((token) => token.address === ethToken);
  const withoutEth = tokens
    .map(toRawToken)
    .filter((token) => token.contract !== ethToken);

  const [updatedTokens, ethBalance] = await Promise.all([
    fetchTokenBalances(withoutEth, user, currentNetwork),
    (async () => includesEth && web3.eth.getBalance(user))(),
  ]);

  return tokens.map((token) => {
    const updatedBalance = updatedTokens.find(
      (t) => token.address === t.contract
    );
    const decimalDifference =
      updatedBalance && updatedBalance.decimals !== token.decimals;
    if (decimalDifference) {
      console.warn(
        `Decimal difference detected on token ${
          token.address
        } where API sourced is ${token.decimals} but blockchain is ${
          updatedBalance!.decimals
        }`
      );
    }
    if (updatedBalance) {
      return {
        ...token,
        balance: shrinkToken(updatedBalance.balance, updatedBalance.decimals),
      };
    } else if (token.address === ethToken && includesEth) {
      return { ...token, balance: shrinkToken(ethBalance as string, 18) };
    } else {
      return token;
    }
  });
};
