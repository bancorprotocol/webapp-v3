import axios from 'axios';
import { combineLatest, from, of } from 'rxjs';
import { map, pluck, shareReplay } from 'rxjs/operators';
import { EthNetworks } from 'web3/types';
import { uniqWith } from 'lodash';
import { toChecksumAddress } from 'web3-utils';

export interface TokenListItem {
  address: string;
  chainId: EthNetworks;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
}

export interface MinimalTokenListItem {
  address: string;
  logoURI: string;
}

const defaultTokenList$ = from(
  axios.get<{ tokens: TokenListItem[] }>(
    'https://wispy-bird-88a7.uniswap.workers.dev/?url=http://tokens.1inch.eth.link'
  )
).pipe(
  pluck('data'),
  pluck('tokens'),
  map((tokens) =>
    tokens.map((token) => ({
      ...token,
      address: toChecksumAddress(token.address),
    }))
  ),
  shareReplay(1)
);

const userPicked$ = of<TokenListItem[]>([]);

export const tokenList$ = combineLatest([userPicked$, defaultTokenList$]).pipe(
  map(([userPicked, tokenList]) => {
    const mixed = [...userPicked, ...tokenList];
    return uniqWith(mixed, (a, b) => a.address === b.address);
  }),
  shareReplay(1)
);
