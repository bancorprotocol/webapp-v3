import { tokenList$ } from 'observables/tokenList';
import { setPools, setTokens } from 'redux/bancorAPI/bancorAPI';
import { pools$ } from 'observables/pools';

export const loadSwapData = (dispatch: any) => {
  tokenList$.subscribe((tokens) => {
    dispatch(setTokens(tokens));
  });
  pools$.subscribe((pools) => {
    dispatch(setPools(pools));
  });
};
