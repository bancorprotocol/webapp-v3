import {
  tokenLists$,
  userPreferredListIds$,
  keeperDaoTokens$,
  listOfLists,
  tokens$,
} from 'services/observables/tokens';
import {
  setKeeperDaoTokens,
  setTokenList,
  setTokenLists,
} from 'redux/bancor/bancor';
import { Subscription } from 'rxjs';
import { getTokenListLS, setTokenListLS } from 'utils/localStorage';

let tokenSub: Subscription;
let tokenListsSub: Subscription;
let keeperDaoSub: Subscription;

export const loadCommonData = (dispatch: any) => {
  if (!tokenListsSub || tokenListsSub.closed)
    tokenLists$.subscribe((tokenLists) => {
      dispatch(setTokenLists(tokenLists));
    });

  const userListIds = getTokenListLS();
  if (userListIds.length === 0) {
    const firstFromList = [listOfLists[0].name];
    setTokenListLS(firstFromList);
    userPreferredListIds$.next(firstFromList);
  } else userPreferredListIds$.next(userListIds);

  if (!tokenSub || tokenSub.closed) {
    tokenSub = tokens$.subscribe((tokenList) => {
      dispatch(setTokenList(tokenList));
    });
  }

  if (!keeperDaoSub || keeperDaoSub.closed)
    keeperDaoSub = keeperDaoTokens$.subscribe((keeperDaoTokens) => {
      setKeeperDaoTokens(keeperDaoTokens);
    });
};

export const loadSwapData = (dispatch: any) => {};

export const loadTokenData = (dispatch: any) => {};
