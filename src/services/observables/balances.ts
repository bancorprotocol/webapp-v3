import { findOrThrow, shrinkToken } from 'utils/pureFunctions';
import { fromPairs, isEqual, partition, toPairs, uniq } from 'lodash';
import {
  slimBalanceShape,
  balanceShape,
  multi,
} from 'services/web3/contracts/shapes';
import { EthNetworks } from 'services/web3/types';
import { ethToken } from 'services/web3/config';
import { web3 } from 'services/web3/contracts';
import { toChecksumAddress } from 'web3-utils';
import { combineLatest, Subject } from 'rxjs';
import { onLogin$, user$ } from './user';
import {
  distinctUntilChanged,
  map,
  scan,
  shareReplay,
  startWith,
} from 'rxjs/operators';
import { switchMapIgnoreThrow } from './customOperators';
import { currentNetwork$ } from './network';
import { apiTokens$ } from './pools';

interface RawBalance {
  contract: string;
  decimals: number;
  balance: string;
}

interface RawToken {
  address: string;
  decimals?: number;
}

interface UserBalance {
  [address: string]: string;
}
interface BalanceDictionary {
  [user: string]: UserBalance;
}

export const fetchTokenBalances = async (
  tokens: RawToken[],
  user: string,
  currentNetwork: EthNetworks
): Promise<RawBalance[]> => {
  const supportedTokens = tokens.filter((token) => token.address !== ethToken);

  const [knownPrecisions, unknownPrecisions] = partition(
    supportedTokens,
    (token) =>
      Object.keys(token).includes('decimals') && !Number.isNaN(token.decimals)
  );

  const knownDecimalShapes = knownPrecisions.map((token) =>
    slimBalanceShape(token.address, user)
  );
  const unknownDecimalShapes = unknownPrecisions.map((token) =>
    balanceShape(token.address, user)
  );

  try {
    const includesEth = tokens.some((token) => token.address === ethToken);

    const [[knownDecimalsRes, unknownDecimalsRes], ethWei] = (await Promise.all(
      [
        multi({
          groupsOfShapes: [knownDecimalShapes, unknownDecimalShapes],
          currentNetwork,
        }),
        (async () => includesEth && web3.eth.getBalance(user))(),
      ]
    )) as [
      [
        { contract: string; balance: string }[],
        { contract: string; balance: string; decimals: string }[]
      ],
      string | boolean
    ];

    const rebuiltDecimals = knownDecimalsRes.map((token): RawBalance => {
      const previouslyKnownPrecision = findOrThrow(
        knownPrecisions,
        (t) => token.contract === t.address
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
    const mergedWei = [...rebuiltDecimals, ...parsedNumbers].map(
      (token): RawBalance => ({
        ...token,
        contract: toChecksumAddress(token.contract),
      })
    );

    if (ethWei) {
      mergedWei.push({
        balance: ethWei as string,
        contract: ethToken,
        decimals: 18,
      });
    }

    return mergedWei;
  } catch (e) {
    console.error('Failed fetching balances');
  }

  return [];
};

const fetchBalanceReceiver$ = new Subject<string[]>();

export const fetchBalances = (addresses: string[]) =>
  fetchBalanceReceiver$.next(addresses);

const rawBalances$ = combineLatest([
  fetchBalanceReceiver$,
  onLogin$,
  apiTokens$,
  currentNetwork$,
]).pipe(
  switchMapIgnoreThrow(async ([addresses, user, tokens, network]) => {
    const rawTokensToFetch = uniq(addresses).map((address): RawToken => {
      if (
        address === ethToken ||
        address === '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
      ) {
        return { decimals: 18, address };
      }
      const apiToken = tokens.find((token) => token.dlt_id === address);
      return apiToken
        ? { decimals: apiToken.decimals, address: apiToken.dlt_id }
        : { address };
    });

    const fetchedTokenBalances = await fetchTokenBalances(
      rawTokensToFetch,
      user,
      network
    );
    return {
      fetchedTokenBalances,
      user,
    };
  })
);

const balances$ = combineLatest([rawBalances$, user$]).pipe(
  scan((acc, [newBalances, user]) => {
    const newBalancesIncoming = newBalances.user === user;
    if (!newBalancesIncoming) return acc;
    const newBalancesShrunk = newBalances.fetchedTokenBalances.map(
      (balance) => [
        toChecksumAddress(balance.contract),
        shrinkToken(balance.balance, balance.decimals),
      ]
    );
    const currentBalances = toPairs(acc[user]);
    const mutationIsRequired = newBalancesShrunk.some(
      ([newContract, newBalance]) => {
        const currentInstance = acc[user] && acc[user][newContract];
        return currentInstance !== newBalance;
      }
    );
    if (!mutationIsRequired) return acc;

    const untouchedBalances = currentBalances.filter(
      ([address]) =>
        !newBalances.fetchedTokenBalances.some((a) => address === a.contract)
    );
    const updatedBalances = [...newBalancesShrunk, ...untouchedBalances];
    const newUserBalances = fromPairs(updatedBalances);

    return {
      ...acc,
      [user]: newUserBalances,
    };
  }, {} as BalanceDictionary)
);

export const userBalances$ = combineLatest([balances$, user$]).pipe(
  map(([balances, user]) => balances[user]),
  startWith<UserBalance>({} as UserBalance),
  distinctUntilChanged<UserBalance>(isEqual),
  shareReplay(1)
);
