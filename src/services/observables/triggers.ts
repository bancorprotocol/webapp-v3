import {
  tokenLists$,
  userPreferredListIds$,
  keeperDaoTokens$,
  listOfLists,
  tokens$,
  pools$,
  tokensNoBalance$,
  tokenListMerged$,
  poolTokens$,
} from 'services/observables/tokens';
import {
  setAllTokens,
  setBntPrice,
  setKeeperDaoTokens,
  setTokenList,
  setTokenLists,
} from 'redux/bancor/bancor';
import { getTokenListLS, setTokenListLS } from 'utils/localStorage';
import { take } from 'rxjs/operators';
import { loadingBalances$ } from './user';
import { setLoadingBalances } from 'redux/user/user';
import { statistics$ } from 'services/observables/statistics';
import { setPools, setStats } from 'redux/bancor/pool';
import { bntPrice$ } from 'services/observables/bancor';
import {
  setAvailableBNT,
  setLockedBNT,
  setPoolTokens,
  setProtectedPositions,
} from 'redux/liquidity/liquidity';
import { Subscription } from 'rxjs';
import { lockedAvailableBnt$, protectedPositions$ } from './liquidity';

let poolTokensSub: Subscription;
let lockedAvailableBntSub: Subscription;
let protectedPositionsSub: Subscription;

export const loadCommonData = (dispatch: any) => {
  tokenLists$.subscribe((tokenLists) => {
    dispatch(setTokenLists(tokenLists));
  });

  tokensNoBalance$
    .pipe(take(1))
    .toPromise()
    .then((tokenList) => dispatch(setTokenList(tokenList)));

  loadingBalances$.subscribe((loading) =>
    dispatch(setLoadingBalances(loading))
  );

  const userListIds = getTokenListLS();
  if (userListIds.length === 0) {
    const firstFromList = [listOfLists[0].name];
    setTokenListLS(firstFromList);
    userPreferredListIds$.next(firstFromList);
  } else userPreferredListIds$.next(userListIds);

  tokens$.subscribe((tokenList) => {
    dispatch(setTokenList(tokenList));
  });

  tokenListMerged$.subscribe((tokenList) => {
    dispatch(setAllTokens(tokenList));
  });

  keeperDaoTokens$.subscribe((keeperDaoTokens) => {
    dispatch(setKeeperDaoTokens(keeperDaoTokens));
  });

  pools$.subscribe((pools) => {
    dispatch(setPools(pools));
  });

  statistics$.subscribe((stats) => {
    dispatch(setStats(stats));
  });

  bntPrice$.subscribe((bntPrice) => {
    dispatch(setBntPrice(bntPrice));
  });
};

export const loadPortfolioData = (dispatch: any) => {
  if (!poolTokensSub || poolTokensSub.closed)
    poolTokensSub = poolTokens$.subscribe((poolTokens) =>
      dispatch(setPoolTokens(poolTokens))
    );

  if (!lockedAvailableBntSub || lockedAvailableBntSub.closed)
    lockedAvailableBnt$.subscribe((availableLocked) => {
      if (availableLocked) {
        dispatch(setAvailableBNT(availableLocked.available));
        dispatch(setLockedBNT(availableLocked.locked));
      }
    });

  if (!protectedPositionsSub || protectedPositionsSub.closed)
    protectedPositions$.subscribe((protectedPositions) => {
      if (protectedPositions)
        dispatch(setProtectedPositions(protectedPositions));
    });
};
