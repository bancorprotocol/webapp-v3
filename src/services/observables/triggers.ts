import {
  allTokensV2$,
  keeperDaoTokens$,
  tokensForTradeWithExternal$,
  tokensV2$,
  tokensV3$,
} from 'services/observables/tokens';
import {
  setAllStandardRewardsV3,
  setAllTokenListTokens,
  setAllTokensV2,
  setKeeperDaoTokens,
  setStatisticsV3,
  setTokenLists,
  setTokensV2,
  setTokensV3,
  setTradeTokens,
} from 'store/bancor/bancor';
import { getTokenListLS, setTokenListLS } from 'utils/localStorage';
import { loadingLockedBnt$, loadingPositions$, loadingRewards$ } from './user';
import { statisticsV3$ } from 'services/observables/statistics';
import { setAllV3Pools, setv2Pools, setv3Pools } from 'store/bancor/pool';
import {
  setLoadingLockedBnt,
  setLoadingPositions,
  setLoadingRewards,
  setLockedAvailableBNT,
  setPoolTokens,
  setProtectedPositions,
  setProtocolBnBNTAmount,
  setRewards,
  setSnapshots,
} from 'store/liquidity/liquidity';
import {
  lockedAvailableBnt$,
  protectedPositions$,
  protocolBnBNTAmount$,
  rewards$,
  snapshots$,
} from './liquidity';
import {
  setHoldingsRaw,
  setStandardRewards,
  setWithdrawalRequestsRaw,
  setWithdrawalSettings,
} from 'store/portfolio/v3Portfolio';
import {
  portfolioHoldings$,
  portfolioStandardRewards$,
  portfolioWithdrawals$,
  portfolioWithdrawalSettings$,
} from 'services/observables/portfolio';
import {
  listOfLists,
  tokenLists$,
  tokenListTokens$,
  userPreferredListIds$,
} from 'services/observables/tokenLists';
import { allpoolsV3$, poolsV2$, poolsV3$ } from 'services/observables/pools';
import { poolTokens$ } from 'services/observables/poolTokensV1';
import { setStakedAmount, setUnstakeTimer } from 'store/gov/gov';
import { stakedAmount$, unstakeTimer$ } from './gov';
import { standardRewardPrograms$ } from 'services/observables/standardRewards';

export const subscribeToObservables = (dispatch: any) => {
  poolsV3$.subscribe((pools) => {
    dispatch(setv3Pools(pools));
  });

  allpoolsV3$.subscribe((pools) => {
    dispatch(setAllV3Pools(pools));
  });

  allTokensV2$.subscribe((tokens) => {
    dispatch(setAllTokensV2(tokens));
  });

  tokensV2$.subscribe((tokensV2) => {
    dispatch(setTokensV2(tokensV2));
  });

  tokensV3$.subscribe((tokensV3) => {
    dispatch(setTokensV3(tokensV3));
  });

  tokensForTradeWithExternal$.subscribe((tokens) => {
    dispatch(setTradeTokens(tokens));
  });

  const userListIds = getTokenListLS();

  tokenLists$.subscribe((tokenLists) => {
    dispatch(setTokenLists(tokenLists));
  });

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

  poolsV2$.subscribe((pools) => {
    dispatch(setv2Pools(pools));
  });

  statisticsV3$.subscribe((stats) => {
    dispatch(setStatisticsV3(stats));
  });

  protectedPositions$.subscribe((protectedPositions) => {
    dispatch(setProtectedPositions(protectedPositions));
  });

  rewards$.subscribe((rewards) => {
    dispatch(setRewards(rewards));
  });

  snapshots$.subscribe((snapshots) => dispatch(setSnapshots(snapshots)));

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

  portfolioStandardRewards$.subscribe((rewards) => {
    dispatch(setStandardRewards(rewards));
  });

  portfolioWithdrawals$.subscribe((withdrawalRequests) => {
    dispatch(setWithdrawalRequestsRaw(withdrawalRequests));
  });

  portfolioWithdrawalSettings$.subscribe((withdrawalSettings) => {
    dispatch(setWithdrawalSettings(withdrawalSettings));
  });

  protocolBnBNTAmount$.subscribe((protocolBnBNTAmount) => {
    dispatch(setProtocolBnBNTAmount(protocolBnBNTAmount));
  });

  stakedAmount$.subscribe((stakedAmount) => {
    dispatch(setStakedAmount(stakedAmount));
  });
  unstakeTimer$.subscribe((unstakeTimer) => {
    dispatch(setUnstakeTimer(unstakeTimer));
  });
  standardRewardPrograms$.subscribe((programs) => {
    dispatch(setAllStandardRewardsV3(programs));
  });
};
