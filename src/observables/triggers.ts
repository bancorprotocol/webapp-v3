import { tokenList$ } from 'observables/tokenList';
import { setTokens } from 'redux/bancorAPI/bancorAPI';

export const loadSwapData = (dispatch: any) => {
  tokenList$.subscribe((tokens) => {
    dispatch(setTokens(tokens));
  });
};
