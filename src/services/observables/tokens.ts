import axios from 'axios';
import { BehaviorSubject, combineLatest, from } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';
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
  getWethAPIToken,
  ropstenImage,
} from 'services/web3/config';
import { web3 } from 'services/web3/contracts';
import { mapIgnoreThrown } from 'utils/pureFunctions';

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
  {
    uri: 'https://tokens.1inch.eth.link',
    name: '1inch',
  },
  {
    uri: 'https://tokens.coingecko.com/uniswap/all.json',
    name: 'CoinGecko',
  },
  {
    uri: 'https://tokenlist.aave.eth.link',
    name: 'Aave Token List',
  },
  {
    uri: 'https://datafi.theagora.eth.link',
    name: 'Agora dataFi Tokens',
  },
  {
    uri: 'https://raw.githubusercontent.com/The-Blockchain-Association/sec-notice-list/master/ba-sec-list.json',
    name: 'BA ERC20 SEC Action',
  },
  {
    uri: 'https://defi.cmc.eth.link',
    name: 'CMC DeFi',
  },
  {
    uri: 'https://stablecoin.cmc.eth.link',
    name: 'CMC Stablecoin',
  },
  {
    uri: 'https://erc20.cmc.eth.link',
    name: 'CMC200 ERC20',
  },
  {
    uri: 'https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json',
    name: 'Compound',
  },
  {
    uri: 'https://defiprime.com/defiprime.tokenlist.json',
    name: 'Defiprime',
  },
  {
    uri: 'https://tokenlist.dharma.eth.link',
    name: 'Dharma Token List',
  },
  {
    uri: 'https://cdn.furucombo.app/furucombo.tokenlist.json',
    name: 'Furucombo',
  },
  {
    uri: 'https://www.gemini.com/uniswap/manifest.json',
    name: 'Gemini Token List',
  },
  {
    uri: 'https://t2crtokens.eth.link',
    name: 'Kleros Tokens',
  },
  {
    uri: 'https://api.kyber.network/tokenlist',
    name: 'Kyber',
  },
  {
    uri: 'https://messari.io/tokenlist/messari-verified',
    name: 'Messari Verified',
  },
  {
    uri: 'https://uniswap.mycryptoapi.com',
    name: 'MyCrypto Token List',
  },
  {
    uri: 'https://raw.githubusercontent.com/opynfinance/opyn-tokenlist/master/opyn-v1.tokenlist.json',
    name: 'Opyn v1',
  },
  {
    uri: 'https://app.tryroll.com/tokens.json',
    name: 'Roll Social Money',
  },
  {
    uri: 'https://raw.githubusercontent.com/SetProtocol/uniswap-tokenlist/main/set.tokenlist.json',
    name: 'Set',
  },
  {
    uri: 'https://umaproject.org/uma.tokenlist.json',
    name: 'UMA',
  },
  {
    uri: 'https://wrapped.tokensoft.eth.link',
    name: 'Wrapped Tokens',
  },
  {
    uri: 'https://yearn.science/static/tokenlist.json',
    name: 'Yearn',
  },
  {
    uri: 'https://zapper.fi/api/token-list',
    name: 'Zapper Token List',
  },
  {
    uri: 'https://tokenlist.zerion.eth.link',
    name: 'Zerion',
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
    async ([userPreferredListIds, tokenLists]): Promise<TokenListItem[]> => {
      if (userPreferredListIds.length === 0) return tokenLists[0].tokens;
      const filteredTokenLists = tokenLists.filter((list) =>
        userPreferredListIds.includes(list.name)
      );
      return filteredTokenLists.flatMap((list) => list.tokens);
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
  switchMapIgnoreThrow(
    async ([userPicked, apiTokens, user, currentNetwork]) => {
      const newApiTokens = [...apiTokens, getWethAPIToken(apiTokens)].map(
        (x) => ({
          address: x.dlt_id,
          symbol: x.symbol,
          decimals: x.decimals,
          usdPrice: x.rate.usd,
        })
      );

      let overlappingTokens: TokenListItem[] = [];
      const eth = getEthToken(apiTokens);
      if (eth) overlappingTokens.push(eth);

      newApiTokens.forEach((apiToken) => {
        if (currentNetwork === EthNetworks.Mainnet) {
          const found = userPicked.find(
            (userToken) =>
              userToken.address.toLowerCase() === apiToken.address.toLowerCase()
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
        overlappingTokens = await fetchTokenBalances(
          overlappingTokens,
          user,
          currentNetwork
        );
        const index = overlappingTokens.findIndex(
          (x) => x.address.toLowerCase() === ethToken.toLowerCase()
        );
        if (index !== -1)
          overlappingTokens[index] = {
            ...overlappingTokens[index],
            balance: fromWei(await web3.eth.getBalance(user)),
          };
      }

      return overlappingTokens;
    }
  ),
  shareReplay(1)
);

export const getTokenLogoURI = (token: TokenListItem) => {
  return token.logoURI
    ? token.logoURI.startsWith('ipfs')
      ? `https://ipfs.io/ipfs/${token.logoURI.split('//')[1]}`
      : token.logoURI
    : `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${toChecksumAddress(
        token.address
      )}/logo.png`;
};

export const getLogoByURI = (uri: string | undefined) => {
  return uri && uri.startsWith('ipfs')
    ? `https://ipfs.io/ipfs/${uri.split('//')[1]}`
    : uri;
};
