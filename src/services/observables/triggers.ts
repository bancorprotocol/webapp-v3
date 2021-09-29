import {
  tokenLists$,
  userPreferredListIds$,
  keeperDaoTokens$,
  listOfLists,
  tokens$,
  tokensNoBalance$,
} from 'services/observables/tokens';
import {
  setKeeperDaoTokens,
  setTokenList,
  setTokenLists,
} from 'redux/bancor/bancor';
import { Subscription } from 'rxjs';
import { getTokenListLS, setTokenListLS } from 'utils/localStorage';
import { take } from 'rxjs/operators';
import { loadingBalances$ } from './user';
import { setLoadingBalances } from 'redux/user/user';
import { pools$ } from 'services/observables/tokens';
import { statistics$ } from 'services/observables/statistics';
import { setPools, setStats } from 'redux/bancor/pool';

let tokenSub: Subscription;
let tokenListsSub: Subscription;
let keeperDaoSub: Subscription;
let loadingBalancesSub: Subscription;
let poolsSub: Subscription;
let statsSub: Subscription;

export const loadCommonData = (dispatch: any) => {
  if (!tokenListsSub || tokenListsSub.closed)
    tokenListsSub = tokenLists$.subscribe((tokenLists) => {
      dispatch(setTokenLists(tokenLists));
    });

  tokensNoBalance$
    .pipe(take(1))
    .toPromise()
    .then((tokenList) => dispatch(setTokenList(tokenList)));

  loadingBalancesSub = loadingBalances$.subscribe((loading) =>
    dispatch(setLoadingBalances(loading))
  );

  const userListIds = getTokenListLS();
  if (userListIds.length === 0) {
    const firstFromList = [listOfLists[0].name];
    setTokenListLS(firstFromList);
    userPreferredListIds$.next(firstFromList);
  } else userPreferredListIds$.next(userListIds);

  tokenSub = tokens$.subscribe((tokenList) => {
    dispatch(setTokenList(tokenList));
  });

  keeperDaoSub = keeperDaoTokens$.subscribe((keeperDaoTokens) => {
    setKeeperDaoTokens(keeperDaoTokens);
  });

  poolsSub = pools$.subscribe((pools) => {
    dispatch(setPools(pools));
  });

  statsSub = statistics$.subscribe((stats) => {
    dispatch(setStats(stats));
  });
};
