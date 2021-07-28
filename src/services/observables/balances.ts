import { findOrThrow, shrinkToken, updateArray } from 'utils/pureFunctions';
import { fromPairs, isEqual, partition, toPairs, uniq, uniqWith } from 'lodash';
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
import { combineLatest, Subject } from 'rxjs';
import { user$ } from './user';
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
  contract: string;
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

    const includesEth = mergedWei.some((wei) => wei.contract === ethToken);
    if (includesEth) {
      const ethBalance = await web3.eth.getBalance(user);
      return updateArray(
        mergedWei,
        (wei) => wei.contract === ethToken,
        () => ({ balance: ethBalance, contract: ethToken, decimals: 18 })
      );
    }
    return mergedWei;
  } catch (e) {
    console.error('Failed fetching balances');
  }

  return [];
};

const toRawToken = (token: Token): RawToken => ({
  contract: token.address,
  ...(token.decimals && { decimals: token.decimals }),
});

const fetchBalanceReceiver$ = new Subject<string[]>();

export const fetchBalances = (addresses: string[]) =>
  fetchBalanceReceiver$.next(addresses);

const rawBalances$ = combineLatest([
  fetchBalanceReceiver$,
  user$,
  apiTokens$,
  currentNetwork$,
]).pipe(
  switchMapIgnoreThrow(async ([addresses, user, tokens, network]) => {
    const rawTokensToFetch = uniq(addresses).map((address): RawToken => {
      const apiToken = tokens.find((token) => token.dlt_id === address);
      return apiToken
        ? { decimals: apiToken.decimals, contract: apiToken.dlt_id }
        : { contract: address };
    });

    console.time('FetchBalance');

    const fetchedTokenBalances = await fetchTokenBalances(
      rawTokensToFetch,
      user,
      network
    );
    console.timeEnd('FetchBalance');
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
    console.log(newBalancesShrunk, 'is shrunk');
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
