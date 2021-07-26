import {
  tokens$,
  tokenLists$,
  userPreferredListIds$,
  keeperDaoTokens$,
} from 'services/observables/tokens';
import {
  setKeeperDaoTokens,
  setTokenList,
  setTokenLists,
} from 'redux/bancor/bancor';

export const loadSwapData = (dispatch: any) => {
  tokenLists$.subscribe((tokenLists) => {
    dispatch(setTokenLists(tokenLists));
  });

  const userListIds = getLSTokenList();
  userPreferredListIds$.next(userListIds);

  tokens$.subscribe((tokenList) => {
    dispatch(setTokenList(tokenList));
  });

  keeperDaoTokens$.subscribe((keeperDaoTokens) => {
    setKeeperDaoTokens(keeperDaoTokens);
  });
};

const selected_lists = 'selected_list_ids';
export const setLSTokenList = (userListIds: string[]) => {
  localStorage.setItem(selected_lists, JSON.stringify(userListIds));
};

export const getLSTokenList = (): string[] => {
  const list = localStorage.getItem(selected_lists);
  return list ? JSON.parse(list) : [];
};
