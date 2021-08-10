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
import { fullPositions$, positions$ } from './protectedPositions';
import { lockedBalances$ } from './lockedBalances';

let tokenSub: Subscription;
let tokenListsSub: Subscription;
let keeperDaoSub: Subscription;

const loadCommonData = (dispatch: any) => {
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

  keeperDaoTokens$.subscribe((keeperDaoTokens) => {
    setKeeperDaoTokens(keeperDaoTokens);
  });

  positions$.subscribe((x) => console.log(x, 'came from positions'));

  fullPositions$.subscribe((x) => console.log(x, 'was full positons'));
  lockedBalances$.subscribe((lockedBalances) =>
    console.log(lockedBalances, 'are the locked balances')
  );

  if (!keeperDaoSub || keeperDaoSub.closed)
    keeperDaoSub = keeperDaoTokens$.subscribe((keeperDaoTokens) => {
      setKeeperDaoTokens(keeperDaoTokens);
    });
};

export const loadSwapData = (dispatch: any) => {
  loadCommonData(dispatch);
};
