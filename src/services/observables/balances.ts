import { findOrThrow, shrinkToken, updateArray } from 'utils/pureFunctions';
import { partition } from 'lodash';
import {
  slimBalanceShape,
  balanceShape,
  multi,
} from 'services/web3/contracts/shapes';
import { EthNetworks } from 'services/web3/types';
import { TokenListItem } from './tokens';

interface TokenOptionalDecimal {
  contract: string;
  decimals?: number;
}

interface TokenAddressWithDecimal {
  contract: string;
  decimals: number;
}

interface TokenBalanceRaw {
  contract: string;
  wei: string;
  decimals: number;
}

const bulkFetchKnownAndUnknownDecimalBalances = async (
  tokens: TokenOptionalDecimal[],
  userAddress: string,
  currentNetwork: EthNetworks
): Promise<TokenBalanceRaw[]> => {
  const [knownPrecisions, unknownPrecisions] = partition(
    tokens,
    (token) => Object.keys(token).includes('decimals') && token.decimals !== 0
  ) as [TokenAddressWithDecimal[], TokenOptionalDecimal[]];

  const knownDecimalShapes = knownPrecisions.map((token) =>
    slimBalanceShape(token.contract, userAddress)
  );
  const unknownDecimalShapes = unknownPrecisions.map((token) =>
    balanceShape(token.contract, userAddress)
  );

  const [knownDecimalsRes, unknownDecimalsRes] = (await multi({
    groupsOfShapes: [knownDecimalShapes, unknownDecimalShapes],
    currentNetwork,
  })) as [
    { contract: string; balance: string }[],
    { contract: string; balance: string; decimals: string }[]
  ];

  const knownPrecisionResult = knownPrecisions.map((token): TokenBalanceRaw => {
    const balance = findOrThrow(
      knownDecimalsRes,
      (res) => res.contract === token.contract
    );
    return {
      contract: token.contract,
      decimals: token.decimals,
      wei: balance.balance,
    };
  });

  const unknownPrecisionResult = unknownDecimalsRes.map(
    (token): TokenBalanceRaw => ({
      contract: token.contract,
      decimals: Number(token.decimals),
      wei: token.balance,
    })
  );

  return [...knownPrecisionResult, ...unknownPrecisionResult];
};

export const fetchTokenBalances = async (
  tokens: TokenListItem[],
  user: string,
  currentNetwork: EthNetworks
): Promise<TokenListItem[]> => {
  const rawWeiBalances = await bulkFetchKnownAndUnknownDecimalBalances(
    tokens.map((token) => ({
      contract: token.address,
      decimals: token.decimals,
    })),
    user,
    currentNetwork
  );

  return updateArray(
    tokens,
    (token) => rawWeiBalances.some((raw) => token.address === raw.contract),
    (token) => {
      const foundBalance = findOrThrow(
        rawWeiBalances,
        (raw) => token.address === raw.contract
      );
      const decBalance =
        foundBalance.wei !== '0'
          ? shrinkToken(foundBalance.wei, foundBalance.decimals)
          : '0';
      return { ...token, balance: decBalance };
    }
  );
};
