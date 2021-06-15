import axios from 'axios';
import { combineLatest, from, of } from 'rxjs';
import { map, pluck, shareReplay } from 'rxjs/operators';
import { EthNetworks } from 'web3/types';
import { uniqWith } from 'lodash';

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
).pipe(pluck('data'), pluck('tokens'), shareReplay(1));

const userPicked$ = of<TokenListItem[]>([]).pipe(map((tokens) => tokens));

export const tokenList$ = combineLatest([userPicked$, defaultTokenList$]).pipe(
  map(([userPicked, tokenList]) => {
    const mixed = [...userPicked, ...tokenList];
    return uniqWith(mixed, (a, b) => a.address === b.address);
  })
);
