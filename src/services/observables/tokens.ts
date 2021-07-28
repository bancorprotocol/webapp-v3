import axios from 'axios';
import { BehaviorSubject, combineLatest, from } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { EthNetworks } from 'services/web3/types';
import { toChecksumAddress } from 'web3-utils';
import { apiTokens$ } from './pools';
import { user$ } from './user';
import { fetchBalances, userBalances$ } from './balances';
import { switchMapIgnoreThrow } from './customOperators';
import { currentNetwork$ } from './network';
import {
  getEthToken,
  buildWethToken,
  ropstenImage,
  ethToken,
} from 'services/web3/config';
import { mapIgnoreThrown } from 'utils/pureFunctions';
import { fetchKeeperDaoTokens } from 'services/api/keeperDao';

export interface TokenList {
  name: string;
  logoURI?: string;
  tokens: Token[];
}

export interface Token {
  address: string;
  chainId: EthNetworks;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
  usdPrice: string | null;
  balance: string | null;
}

export const listOfLists = [
  {
    uri: 'https://tokens.coingecko.com/ethereum/all.json',
    name: 'CoinGecko',
  },
  {
    uri: 'https://tokenlist.zerion.eth.link',
    name: 'Zerion',
  },
  {
    uri: 'https://zapper.fi/api/token-list',
    name: 'Zapper Token List',
  },
  {
    uri: 'https://tokens.1inch.eth.link',
    name: '1inch',
  },
  {
    uri: 'https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json',
    name: 'Compound',
  },
  {
    uri: 'https://yearn.science/static/tokenlist.json',
    name: 'Yearn',
  },
  {
    uri: 'https://uniswap.mycryptoapi.com',
    name: 'MyCrypto Token List',
  },
  {
    uri: 'https://tokenlist.aave.eth.link',
    name: 'Aave Token List',
  },
  {
    uri: 'https://defiprime.com/defiprime.tokenlist.json',
    name: 'Defiprime',
  },
];

export const userPreferredListIds$ = new BehaviorSubject<string[]>([]);

export const tokenLists$ = from(
  mapIgnoreThrown(listOfLists, async (list) => {
    const res = await axios.get<TokenList>(list.uri);
    return res.data;
  })
).pipe(shareReplay(1));

const tokenListMerged$ = combineLatest([
  userPreferredListIds$,
  tokenLists$,
]).pipe(
  switchMapIgnoreThrow(
    async ([userPreferredListIds, tokenLists]): Promise<Token[]> => {
      const filteredTokenLists = tokenLists.filter((list) =>
        userPreferredListIds.some((id) => id === list.name)
      );
      return filteredTokenLists.flatMap((list) => list.tokens);
    }
  ),
  map((tokens) =>
    tokens.map((token) => ({
      ...token,
      address: toChecksumAddress(token.address),
    }))
  ),
  shareReplay()
);

export const tokensWithoutBalances$ = combineLatest([
  tokenListMerged$,
  apiTokens$,
  user$,
  currentNetwork$,
]).pipe(
  switchMapIgnoreThrow(async ([tokenList, apiTokens, user, currentNetwork]) => {
    const newApiTokens = [...apiTokens, buildWethToken(apiTokens)].map((x) => ({
      address: x.dlt_id,
      symbol: x.symbol,
      decimals: x.decimals,
      usdPrice: x.rate.usd,
    }));

    let overlappingTokens: Token[] = [];
    const eth = getEthToken(apiTokens);
    if (eth) overlappingTokens.push(eth);

    newApiTokens.forEach((apiToken) => {
      if (currentNetwork === EthNetworks.Mainnet) {
        const found = tokenList.find(
          (userToken) => userToken.address === apiToken.address
        );
        if (found)
          overlappingTokens.push({
            ...found,
            ...apiToken,
          });
      } else {
        if (apiToken.address !== ethToken)
          overlappingTokens.push({
            chainId: EthNetworks.Ropsten,
            name: apiToken.symbol,
            logoURI: ropstenImage,
            balance: null,
            ...apiToken,
          });
      }
    });

    fetchBalances(overlappingTokens.map((token) => token.address));

    return overlappingTokens;
  }),
  shareReplay(1)
);

export const tokens$ = combineLatest([
  tokensWithoutBalances$,
  userBalances$,
]).pipe(
  map(([tokens, userBalances]) => {
    return tokens.map((token) => {
      if (userBalances) {
        const userBalance = userBalances[token.address];
        return userBalance === undefined
          ? token
          : { ...token, balance: userBalance };
      } else {
        return token;
      }
    });
  }),
  shareReplay(1)
);

export const keeperDaoTokens$ = from(fetchKeeperDaoTokens()).pipe(
  shareReplay(1)
);

const buildIpfsUri = (ipfsHash: string) => `https://ipfs.io/ipfs/${ipfsHash}`;

export const getTokenLogoURI = (token: Token) =>
  token.logoURI
    ? token.logoURI.startsWith('ipfs')
      ? buildIpfsUri(token.logoURI.split('//')[1])
      : token.logoURI
    : `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${token.address}/logo.png`;

export const getLogoByURI = (uri: string | undefined) =>
  uri && uri.startsWith('ipfs') ? buildIpfsUri(uri.split('//')[1]) : uri;
