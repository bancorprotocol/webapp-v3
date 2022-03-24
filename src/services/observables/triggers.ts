import { keeperDaoTokens$ } from 'services/observables/tokens';
import {
  setAllTokenListTokens,
  setAllTokens,
  setKeeperDaoTokens,
  setTokenLists,
  setTokens,
} from 'redux/bancor/bancor';
import { getTokenListLS, setTokenListLS } from 'utils/localStorage';
import { loadingLockedBnt$, loadingPositions$, loadingRewards$ } from './user';
import { statistics$ } from 'services/observables/statistics';
import { setv2Pools, setStats } from 'redux/bancor/pool';
import {
  setLoadingLockedBnt,
  setLoadingPositions,
  setLoadingRewards,
  setLockedAvailableBNT,
  setPoolTokens,
  setProtectedPositions,
  setRewards,
} from 'redux/liquidity/liquidity';
import {
  lockedAvailableBnt$,
  protectedPositions$,
  rewards$,
} from './liquidity';
import {
  setHoldingsRaw,
  setWithdrawalRequestsRaw,
  setWithdrawalSettings,
} from 'redux/portfolio/v3Portfolio';
import {
  portfolioHoldings$,
  portfolioWithdrawals$,
  portfolioWithdrawalSettings$,
} from 'services/observables/v3/portfolio';
import { allTokensNew$, tokensNew$ } from 'services/observables/v3/tokens';
import {
  listOfLists,
  tokenListsNew$,
  tokenListTokens$,
  userPreferredListIds$,
} from 'services/observables/v3/tokenLists';
import { poolsNew$ } from 'services/observables/v3/pools';
import { poolTokens$ } from 'services/observables/v3/poolTokensV1';

export const subscribeToObservables = (dispatch: any) => {
  tokenListsNew$.subscribe((tokenLists) => {
    dispatch(setTokenLists(tokenLists));
  });

  allTokensNew$.subscribe((tokens) => {
    dispatch(setAllTokens(tokens));
  });

  tokensNew$.subscribe((tokens) => {
    dispatch(setTokens(tokens));
  });

  const userListIds = getTokenListLS();
  if (userListIds.length === 0) {
    const twoLists = [listOfLists[0].name, listOfLists[1].name];
    setTokenListLS(twoLists);
    userPreferredListIds$.next(twoLists);
  } else userPreferredListIds$.next(userListIds);

  tokenListTokens$.subscribe(({ allTokenListTokens }) => {
    dispatch(setAllTokenListTokens(allTokenListTokens));
  });

  keeperDaoTokens$.subscribe((keeperDaoTokens) => {
    dispatch(setKeeperDaoTokens(keeperDaoTokens));
  });

  poolsNew$.subscribe((pools) => {
    dispatch(setv2Pools(pools));
  });

  statistics$.subscribe((stats) => {
    dispatch(setStats(stats));
  });

  protectedPositions$.subscribe((protectedPositions) => {
    dispatch(setProtectedPositions(protectedPositions));
  });

  rewards$.subscribe((rewards) => {
    dispatch(setRewards(rewards));
  });

  poolTokens$.subscribe((poolTokens) => dispatch(setPoolTokens(poolTokens)));

  lockedAvailableBnt$.subscribe((lockedAvailableBnt) => {
    if (lockedAvailableBnt) {
      dispatch(setLockedAvailableBNT(lockedAvailableBnt));
    }
  });

  loadingPositions$.subscribe((loadingPositions) =>
    dispatch(setLoadingPositions(loadingPositions))
  );
  loadingRewards$.subscribe((loadingRewards) =>
    dispatch(setLoadingRewards(loadingRewards))
  );
  loadingLockedBnt$.subscribe((loadingLockedBnt) =>
    dispatch(setLoadingLockedBnt(loadingLockedBnt))
  );

  portfolioHoldings$.subscribe((holdingsRaw) => {
    dispatch(setHoldingsRaw(holdingsRaw));
  });

  portfolioWithdrawals$.subscribe((withdrawalRequests) => {
    dispatch(setWithdrawalRequestsRaw(withdrawalRequests));
  });

  portfolioWithdrawalSettings$.subscribe((withdrawalSettings) => {
    dispatch(setWithdrawalSettings(withdrawalSettings));
  });
};
