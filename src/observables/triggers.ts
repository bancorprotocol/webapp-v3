import { tokenLists$, tokenList$, TokenListItem } from 'observables/tokenList';
import { setTokenLists } from 'redux/bancor/bancor';
import { setTokens } from 'redux/bancorAPI/bancorAPI';
import { apiTokens$ } from './pools';

export const loadSwapData = async (dispatch: any) => {
  tokenLists$.subscribe((tokenList) => dispatch(setTokenLists(tokenList)));
  tokenList$.subscribe((tokens) => dispatch(setTokens(tokens)));
};
