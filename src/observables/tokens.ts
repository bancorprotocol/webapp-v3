import { ViewToken } from 'redux/bancorAPI/bancorAPI';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { apiTokens$ } from './pools';
import { tokenList$ } from './tokenList';

const tokens = combineLatest([apiTokens$, tokenList$]).pipe(
  map(([tokens, tokenList]) => {
    return tokens.map((token): ViewToken => ({ logoURI }));
  })
);
