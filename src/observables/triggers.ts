import { tokenList$, tokenLists$, userLists$ } from 'observables/tokens';
import { setTokenList, setTokenLists } from 'redux/bancor/bancor';
import { take } from 'rxjs/operators';

export const loadSwapData = (dispatch: any) => {
  tokenLists$.subscribe((tokenLists) => {
    dispatch(setTokenLists(tokenLists));
  });
  const userLists: number[] = getLSTokenList();
  refreshTokenList(dispatch, userLists);
};

export const refreshTokenList = async (dispatch: any, userLists: number[]) => {
  userLists$.next(userLists);
  dispatch(setTokenList(await tokenList$.pipe(take(1)).toPromise()));
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
