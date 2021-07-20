import axios from 'axios';
import { BehaviorSubject, combineLatest, from } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { EthNetworks } from 'services/web3/types';
import { toChecksumAddress, fromWei } from 'web3-utils';
import { apiTokens$ } from './pools';
import { user$ } from './user';
import { fetchTokenBalances } from './balances';
import { switchMapIgnoreThrow } from './customOperators';
import { currentNetwork$ } from './network';
import {
  ethToken,
  getEthToken,
  buildWethToken,
  ropstenImage,
} from 'services/web3/config';
import { web3 } from 'services/web3/contracts';
import { mapIgnoreThrown, updateArray } from 'utils/pureFunctions';

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
  balance: string | null;
}

const listOfLists = [
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

export const userLists$ = new BehaviorSubject<number[]>([]);

export const tokenLists$ = from(
  mapIgnoreThrown(listOfLists, async (list) => {
    const res = await axios.get<TokenList>(list);
    return res.data;
  })
).pipe(shareReplay(1));

const tokenListMerged$ = combineLatest([userLists$, tokenLists$]).pipe(
  switchMapIgnoreThrow(
    async ([userLists, tokenLists]): Promise<TokenListItem[]> => {
      if (userLists.length === 0) return tokenLists[0].tokens;
      const filteredTokenLists = tokenLists.filter((list, index) =>
        userLists.includes(index)
      );
      return filteredTokenLists
        .flatMap((list) => list.tokens)
        .map((x) => ({ ...x, address: toChecksumAddress(x.address) }));
    }
  ),
  shareReplay()
);

export const tokenList$ = combineLatest([
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

    let overlappingTokens: TokenListItem[] = [];
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
        overlappingTokens.push({
          chainId: EthNetworks.Ropsten,
          name: apiToken.symbol,
          logoURI: ropstenImage,
          balance: null,
          ...apiToken,
        });
      }
    });

    if (user) {
      const includesEth = overlappingTokens.some(
        (token) => token.address === ethToken
      );

      const [updatedTokens, ethBalance] = await Promise.all([
        fetchTokenBalances(overlappingTokens, user, currentNetwork),
        (async () => includesEth && web3.eth.getBalance(user))(),
      ]);

      const finalTokens = includesEth
        ? updateArray(
            updatedTokens,
            (token) => token.address === ethToken,
            (token) => ({ ...token, balance: fromWei(ethBalance as string) })
          )
        : updatedTokens;
      return finalTokens;
    } else {
      return overlappingTokens;
    }
  }),
  shareReplay(1)
);

export const getTokenLogoURI = (token: TokenListItem) => {
  return token.logoURI
    ? token.logoURI.startsWith('ipfs')
      ? `https://ipfs.io/ipfs/${token.logoURI.split('//')[1]}`
      : token.logoURI
    : `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${token.address}/logo.png`;
};

export const getLogoByURI = (uri: string | undefined) => {
  return uri && uri.startsWith('ipfs')
    ? `https://ipfs.io/ipfs/${uri.split('//')[1]}`
    : uri;
};
