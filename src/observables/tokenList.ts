import axios from 'axios';
import { combineLatest, from, of } from 'rxjs';
import {
  distinctUntilChanged,
  map,
  pluck,
  shareReplay,
  take,
} from 'rxjs/operators';
import { EthNetworks } from 'web3/types';
import { differenceBy, differenceWith, uniqBy, uniqWith } from 'lodash';
import { toChecksumAddress } from 'web3-utils';
import { apiTokens$ } from './pools';

export interface TokenList {
  name: string;
  logoURI?: string;
  tokens: TokenListItem[];
}

export interface TokenListItem {
  address: string;
  chainId: EthNetworks;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
  usdPrice: string | null;
}

const list_of_lists = [
  'https://tokens.1inch.eth.link',
  'https://tokens.coingecko.com/uniswap/all.json',
  'https://tokenlist.aave.eth.link',
  'https://datafi.theagora.eth.link',
  'https://raw.githubusercontent.com/The-Blockchain-Association/sec-notice-list/master/ba-sec-list.json',
  'https://defi.cmc.eth.link',
  'https://stablecoin.cmc.eth.link',
  'https://erc20.cmc.eth.link',
  'https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json',
  'https://defiprime.com/defiprime.tokenlist.json',
  'https://tokenlist.dharma.eth.link',
  'https://cdn.furucombo.app/furucombo.tokenlist.json',
  'https://www.gemini.com/uniswap/manifest.json',
  'https://t2crtokens.eth.link',
  'https://api.kyber.network/tokenlist',
  'https://messari.io/tokenlist/messari-verified',
  'https://uniswap.mycryptoapi.com',
  'https://raw.githubusercontent.com/opynfinance/opyn-tokenlist/master/opyn-v1.tokenlist.json',
  'https://app.tryroll.com/tokens.json',
  'https://raw.githubusercontent.com/SetProtocol/uniswap-tokenlist/main/set.tokenlist.json',
  'https://umaproject.org/uma.tokenlist.json',
  'https://wrapped.tokensoft.eth.link',
  'https://yearn.science/static/tokenlist.json',
  'https://zapper.fi/api/token-list',
  'https://tokenlist.zerion.eth.link',
];

export const tokenLists$ = from(
  Promise.all(
    list_of_lists.map(async (list) => {
      const res = await axios.get<TokenList>(list);
      return res.data;
    })
  )
).pipe(shareReplay(1));

export const getLogoURI = (token: TokenListItem) => {
  return token.logoURI
    ? token.logoURI.startsWith('ipfs')
      ? `https://ipfs.io/ipfs/${token.logoURI.split('//')[1]}`
      : token.logoURI
    : `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${toChecksumAddress(
        token.address
      )}/logo.png`;
};

export const getTokenListByUser = async (indexes: number[]) => {
  const tokenLists = await tokenLists$.pipe(take(1)).toPromise();
  const apiTokens = (await apiTokens$.pipe(take(1)).toPromise()).map((x) => ({
    address: x.dlt_id,
    symbol: x.symbol,
    decimals: x.decimals,
    usdPrice: x.rate.usd,
  }));
  let userPicked: TokenListItem[] = [];
  tokenLists.forEach((list, index) => {
    if (indexes.includes(index)) userPicked.push(...list.tokens);
  });

  let overlappingTokens: TokenListItem[] = [];
  apiTokens.forEach((apiToken) => {
    const found = userPicked.find(
      (userToken) =>
        userToken.address.toLowerCase() === apiToken.address.toLowerCase()
    );

    if (found)
      overlappingTokens.push({
        ...found,
        ...apiToken,
      });
  });

  return overlappingTokens;
};
