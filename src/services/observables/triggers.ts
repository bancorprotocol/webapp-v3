import {
  tokens$,
  tokenLists$,
  userPreferredListIds$,
} from 'services/observables/tokens';
import { setTokenList, setTokenLists } from 'redux/bancor/bancor';
import { loadSwapInfo } from 'services/web3/swap/methods';

export const loadSwapData = (dispatch: any) => {
  loadSwapInfo();

  tokenLists$.subscribe((tokenLists) => {
    dispatch(setTokenLists(tokenLists));
  });

  const userListIds = getLSTokenList();
  userPreferredListIds$.next(userListIds);

  tokens$.subscribe((tokenList) => {
    dispatch(setTokenList(tokenList));
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
