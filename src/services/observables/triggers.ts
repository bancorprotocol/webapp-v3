import {
  tokenList$,
  tokenLists$,
  userLists$,
} from 'services/observables/tokens';
import { setTokenList, setTokenLists } from 'redux/bancor/bancor';
import { loadSwapInfo } from 'services/web3/swap/methods';

export const loadSwapData = (dispatch: any) => {
  loadSwapInfo();

  tokenLists$.subscribe((tokenLists) => {
    dispatch(setTokenLists(tokenLists));
  });

  const userLists: number[] = getLSTokenList();
  userLists$.next(userLists);

  tokenList$.subscribe((tokenList) => {
    dispatch(setTokenList(tokenList));
  });
};

const selected_lists = 'selected_lists';
export const setLSTokenList = (userLists: number[]) => {
  localStorage.setItem(selected_lists, userLists.join(','));
};

export const getLSTokenList = (): number[] => {
  const list = localStorage.getItem(selected_lists);
  if (list) return list.split(',').map((x) => Number(x));

  return [];
};
