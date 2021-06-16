import { ViewToken } from 'redux/bancorAPI/bancorAPI';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { apiTokens$ } from './pools';
import { tokenList$ } from './tokenList';

export const tokens$ = combineLatest([apiTokens$, tokenList$]).pipe(
  map(([tokens, tokenList]) => {
    return tokens.map((token): ViewToken => {
      const tokenListItem = tokenList.find(
        (tokenListItem) => token.dlt_id === tokenListItem.address
      );

      return {
        logoURI:
          (tokenListItem && tokenListItem.logoURI) ||
          'https://ropsten.etherscan.io/images/main/empty-token.png',
        name: token.symbol,
        symbol: (tokenListItem && tokenListItem.name) || token.symbol,
        id: token.dlt_id,
        tokenListSupported: !!tokenListItem,
      };
    });
  })
);
