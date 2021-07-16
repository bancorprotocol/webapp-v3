import { findOrThrow, shrinkToken } from 'utils/pureFunctions';
import { partition } from 'lodash';
import {
  slimBalanceShape,
  balanceShape,
  multi,
} from 'services/web3/contracts/shapes';
import { EthNetworks } from 'services/web3/types';
import { TokenListItem } from './tokens';

export const fetchTokenBalances = async (
  tokens: TokenListItem[],
  user: string,
  currentNetwork: EthNetworks
): Promise<TokenListItem[]> => {
  const [knownPrecisions, unknownPrecisions] = partition(
    tokens,
    (token) => Object.keys(token).includes('decimals') && token.decimals !== 0
  );

  const knownDecimalShapes = knownPrecisions.map((token) =>
    slimBalanceShape(token.address, user)
  );
  const unknownDecimalShapes = unknownPrecisions.map((token) =>
    balanceShape(token.address, user)
  );

  try {
    const [knownDecimalsRes, unknownDecimalsRes] = (await multi({
      groupsOfShapes: [knownDecimalShapes, unknownDecimalShapes],
      currentNetwork,
    })) as [
      { contract: string; balance: string }[],
      { contract: string; balance: string; decimals: string }[]
    ];

    const rebuiltDecimals = knownDecimalsRes.map((token) => {
      const previouslyKnownPrecision = findOrThrow(
        knownPrecisions,
        (t) => token.contract.toLowerCase() === t.address.toLowerCase()
      );
      return {
        ...token,
        decimals: previouslyKnownPrecision.decimals!,
      };
    });

    const parsedNumbers = unknownDecimalsRes.map((res) => ({
      ...res,
      decimals: Number(res.decimals),
    }));
    const mergedWei = [...rebuiltDecimals, ...parsedNumbers];
    return mergedWei.map((token) => {
      const inedx = tokens.findIndex(
        (t) => t.address.toLowerCase() === token.contract.toLowerCase()
      );
      return {
        ...tokens[inedx],
        balance: token.balance
          ? token.balance !== '0'
            ? shrinkToken(token.balance, token.decimals)
            : token.balance
          : null,
      };
    });
  } catch (e) {
    console.error('Failed fetching balances');
  }

  return [];
};
