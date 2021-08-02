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
import { setFromToken, setToToken } from 'redux/intoTheBlock/intoTheBlock';
import { fromTokenIntoTheBlock$, toTokenIntoTheBlock$ } from './intoTheBlock';

export const loadSwapData = (dispatch: any) => {
  tokenLists$.subscribe((tokenLists) => {
    dispatch(setTokenLists(tokenLists));
  });

  const userListIds = getLSTokenList();
  if (userListIds.length === 0) {
    const firstFromList = [listOfLists[0].name];
    setLSTokenList(firstFromList);
    userPreferredListIds$.next(firstFromList);
  } else userPreferredListIds$.next(userListIds);

  tokens$.subscribe((tokenList) => {
    dispatch(setTokenList(tokenList));
  });

  keeperDaoTokens$.subscribe((keeperDaoTokens) => {
    setKeeperDaoTokens(keeperDaoTokens);
  });

  fromTokenIntoTheBlock$.subscribe((token) => dispatch(setFromToken(token)));
  toTokenIntoTheBlock$.subscribe((token) => dispatch(setToToken(token)));
};

const selected_lists = 'selected_list_ids';
export const setLSTokenList = (userListIds: string[]) => {
  localStorage.setItem(selected_lists, JSON.stringify(userListIds));
};

export const getLSTokenList = (): string[] => {
  const list = localStorage.getItem(selected_lists);
  return list ? JSON.parse(list) : [];
};
