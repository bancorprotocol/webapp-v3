import { getTokenListByUser, tokenLists$ } from 'observables/tokenList';
import { setTokenList, setTokenLists } from 'redux/bancor/bancor';

export const loadSwapData = async (dispatch: any) => {
  tokenLists$.subscribe((tokenLists) => {
    dispatch(setTokenLists(tokenLists));
  });
  dispatch(setTokenList(await getTokenListByUser([1])));
};
