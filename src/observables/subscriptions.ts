import { setTokens } from 'redux/bancorAPI/bancorAPI';
import { tokens$ } from './tokens';

export const startSubsriptions = () => {
  tokens$.subscribe((tokens) => {
    setTokens(tokens);
  });
};
