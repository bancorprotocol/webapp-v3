import axios from 'axios';
import { BehaviorSubject, combineLatest, from } from 'rxjs';
import {
  distinctUntilChanged,
  map,
  pluck,
  share,
  shareReplay,
} from 'rxjs/operators';
import { EthNetworks } from 'services/web3/types';
import { utils } from 'ethers';
import { apiData$, correctedPools$, partialPoolTokens$ } from './pools';
import { setLoadingBalances, user$ } from './user';
import { switchMapIgnoreThrow } from './customOperators';
import { currentNetwork$ } from './network';
import {
  getEthToken,
  buildWethToken,
  ropstenImage,
  ethToken,
  wethToken,
} from 'services/web3/config';
import {
  get7DaysAgo,
  mapIgnoreThrown,
  sortTokenBalanceAlphabetic,
} from 'utils/pureFunctions';
import { fetchKeeperDaoTokens } from 'services/api/keeperDao';
import { fetchTokenBalances } from './balances';
import { calculatePercentageChange, shrinkToken } from 'utils/formulas';
import { isEqual, sortBy, uniqBy } from 'lodash';
import { APIReward, WelcomeData } from 'services/api/bancor';
import BigNumber from 'bignumber.js';
import { UTCTimestamp } from 'lightweight-charts';
import { settingsContractAddress$ } from 'services/observables/contracts';
import { LiquidityProtectionSettings__factory } from 'services/web3/abis/types';
import { web3 } from 'services/web3';
import { multicall } from 'services/web3/multicall/multicall';
import { buildTokenPoolCall } from 'services/web3/swap/market';
import { findPoolByConverter } from '../../utils/helperFunctions';

export const apiTokens$ = apiData$.pipe(
  pluck('tokens'),
  distinctUntilChanged<WelcomeData['tokens']>(isEqual),
  share()
);

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
  liquidity: string | null;
  usd_24h_ago: string | null;
  price_change_24: number;
  price_history_7d: { time: UTCTimestamp; value: number }[];
  usd_volume_24: string | null;
  isWhitelisted?: boolean;
}

export interface Reserve {
  address: string;
  weight: string;
  balance: string;
  symbol: string;
  logoURI: string;
  rewardApr?: number;
  decimals: number;
  usdPrice: number | string | null;
}

export interface Pool {
  name: string;
  pool_dlt_id: string;
  converter_dlt_id: string;
  reserves: Reserve[];
  liquidity: number;
  volume_24h: number;
  fees_24h: number;
  fee: number;
  version: number;
  supply: number;
  decimals: number;
  isWhitelisted: boolean;
  apr: number;
  reward?: APIReward;
  isProtected: boolean;
}

export interface PoolToken {
  bnt: {
    token: Reserve;
    amount: string;
  };
  tkn: {
    token: Reserve;
    amount: string;
  };
  amount: string;
  value: string;
  poolDecimals: number;
  converter: string;
  poolName: string;
  version: number;
}

export const listOfLists = [
  {
    uri: 'https://tokens.1inch.eth.link',
    name: '1inch',
  },
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
    return {
      ...res.data,
      logoURI: getLogoByURI(res.data.logoURI),
    };
  })
).pipe(shareReplay(1));

export const tokenListMerged$ = combineLatest([
  userPreferredListIds$,
  tokenLists$,
]).pipe(
  switchMapIgnoreThrow(
    async ([userPreferredListIds, tokenLists]): Promise<Token[]> => {
      const filteredTokenLists = tokenLists.filter((list) =>
        userPreferredListIds.some((id) => id === list.name)
      );
      const merged = filteredTokenLists.flatMap((list) => list.tokens);
      return uniqBy(merged, (x) => x.address);
    }
  ),
  map((tokens) =>
    tokens.map((token) => ({
      ...token,
      address: utils.getAddress(token.address),
    }))
  ),
  shareReplay()
);

export const tokensNoBalance$ = combineLatest([
  tokenListMerged$,
  apiTokens$,
  correctedPools$,
  currentNetwork$,
]).pipe(
  map(([tokenList, apiTokens, pools, currentNetwork]) => {
    const newApiTokens = [...apiTokens, buildWethToken(apiTokens)].map((x) => {
      const usdPrice = x.rate.usd;
      const price_24h = x.rate_24h_ago.usd;
      const priceChanged =
        usdPrice && price_24h && Number(price_24h) !== 0
          ? calculatePercentageChange(Number(usdPrice), Number(price_24h))
          : 0;
      const pool = pools.find((p) =>
        p.reserves.find((r) => r.address === x.dlt_id)
      );
      const usdVolume24 = pool ? pool.volume_24h.usd : null;
      const isWhitelisted = pool ? pool.isWhitelisted : false;

      const seven_days_ago = get7DaysAgo().getUTCSeconds();
      return {
        address: x.dlt_id,
        symbol: x.symbol,
        decimals: x.decimals,
        usdPrice,
        liquidity: x.liquidity.usd,
        usd_24h_ago: price_24h,
        price_change_24: priceChanged,
        price_history_7d: x.rates_7d
          .filter((x) => !!x)
          .map((x, i) => ({
            value: Number(x),
            time: (seven_days_ago + i * 360) as UTCTimestamp,
          })),
        usd_volume_24: usdVolume24,
        isWhitelisted,
      };
    });

    let overlappingTokens: Token[] = [];
    const eth = getEthToken(apiTokens, pools);
    if (eth) overlappingTokens.push(eth);

    newApiTokens.forEach((apiToken) => {
      if (currentNetwork === EthNetworks.Mainnet) {
        const found = tokenList.find(
          (userToken) => userToken.address === apiToken.address
        );
        if (found) {
          overlappingTokens.push({
            ...found,
            ...apiToken,
            logoURI: getTokenLogoURI(found),
          });
        }
      } else {
        if (apiToken.address !== ethToken && apiToken.address !== wethToken)
          overlappingTokens.push({
            chainId: EthNetworks.Ropsten,
            name: apiToken.symbol,
            logoURI: ropstenImage,
            balance: null,
            ...apiToken,
          });
      }
    });

    return overlappingTokens;
  }),
  shareReplay(1)
);

export const tokens$ = combineLatest([user$, tokensNoBalance$]).pipe(
  switchMapIgnoreThrow(async ([user, tokensNoBalance]) => {
    if (user && tokensNoBalance) {
      setLoadingBalances(true);
      const updatedTokens = await fetchTokenBalances(tokensNoBalance, user);
      setLoadingBalances(false);
      if (updatedTokens.length !== 0)
        return updatedTokens.sort(sortTokenBalanceAlphabetic);
    }

    return tokensNoBalance;
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

const getLogoByURI = (uri: string | undefined) =>
  uri && uri.startsWith('ipfs') ? buildIpfsUri(uri.split('//')[1]) : uri;

export const minNetworkTokenLiquidityForMinting$ = combineLatest([
  settingsContractAddress$,
]).pipe(
  switchMapIgnoreThrow(async ([liquidityProtectionSettingsContract]) => {
    const contract = LiquidityProtectionSettings__factory.connect(
      liquidityProtectionSettingsContract,
      web3.provider
    );
    const res = await contract.minNetworkTokenLiquidityForMinting();
    return shrinkToken(res.toString(), 18);
  }),
  distinctUntilChanged<string>(isEqual),
  shareReplay(1)
);

export const pools$ = combineLatest([
  correctedPools$,
  tokens$,
  minNetworkTokenLiquidityForMinting$,
  currentNetwork$,
]).pipe(
  switchMapIgnoreThrow(
    async ([pools, tokens, minMintingBalance, currentNetwork]) => {
      const tokensMap = new Map(tokens.map((t) => [t.address, t]));
      const newPools: (Pool | null)[] = pools.map((pool) => {
        let apr = 0;
        const liquidity = Number(pool.liquidity.usd ?? 0);
        const fees_24h = Number(pool.fees_24h.usd ?? 0);
        if (liquidity && fees_24h) {
          apr = new BigNumber(fees_24h)
            .times(365)
            .div(liquidity)
            .times(100)
            .toNumber();
        }
        const reserveTokenOne = tokensMap.get(pool.reserves[0].address);

        if (!reserveTokenOne) return null;

        const reserveTokenTwo = tokensMap.get(pool.reserves[1].address);

        if (!reserveTokenTwo) return null;

        const reserves: Reserve[] = [
          {
            ...pool.reserves[0],
            rewardApr: Number(pool.reserves[0].apr) / 10000,
            symbol: reserveTokenOne.symbol,
            logoURI:
              currentNetwork === EthNetworks.Mainnet
                ? getTokenLogoURI(reserveTokenOne)
                : ropstenImage,
            decimals: reserveTokenOne.decimals,
            usdPrice: reserveTokenOne.usdPrice,
          },
          {
            ...pool.reserves[1],
            rewardApr: Number(pool.reserves[1].apr) / 10000,
            symbol: reserveTokenTwo.symbol,
            logoURI:
              currentNetwork === EthNetworks.Mainnet
                ? getTokenLogoURI(reserveTokenTwo)
                : ropstenImage,
            decimals: reserveTokenTwo.decimals,
            usdPrice: reserveTokenTwo.usdPrice,
          },
        ];

        const bntReserve = reserves.find((r) => r.symbol === 'BNT');
        const sufficientMintingBalance = new BigNumber(minMintingBalance).lt(
          bntReserve ? bntReserve.balance : 0
        );
        const isProtected = sufficientMintingBalance && pool.isWhitelisted;

        return {
          ...pool,
          reserves: sortBy(reserves, [(o) => o.symbol === 'BNT']),
          liquidity,
          volume_24h: Number(pool.volume_24h.usd ?? 0),
          fees_24h,
          fee: Number(pool.fee) / 10000,
          supply: Number(pool.supply),
          apr,
          isProtected,
        };
      });

      return newPools.filter((x) => !!x) as Pool[];
    }
  ),
  shareReplay(1)
);

export const poolTokens$ = combineLatest([
  pools$,
  partialPoolTokens$,
  apiData$,
]).pipe(
  switchMapIgnoreThrow(async ([pools, partialPoolTokens, apiData]) => {
    const res = await Promise.all<PoolToken | null>(
      partialPoolTokens.map(async (poolToken) => {
        const pool = findPoolByConverter(
          poolToken.converter,
          pools,
          apiData.pools
        );
        if (!pool) {
          return null;
        }
        const tkn = pool.reserves[0];
        const bnt = pool.reserves[1];

        const amount = shrinkToken(poolToken.balance, pool.decimals);
        const percent = new BigNumber(amount).div(
          shrinkToken(poolToken.totalSupply, pool.decimals)
        );

        const balances = await multicall(
          pool.reserves.map((x) =>
            buildTokenPoolCall(pool.converter_dlt_id, x.address)
          )
        );
        if (!balances) {
          return null;
        }
        const tknBalanceWei = new BigNumber(balances[0].toString());
        const bntBalanceWei = new BigNumber(balances[1].toString());

        const tknAmount = percent.times(
          shrinkToken(tknBalanceWei, pool.decimals)
        );
        const bntAmount = percent.times(
          shrinkToken(bntBalanceWei, pool.decimals)
        );

        const value = tknAmount
          // @ts-ignore
          .times(Number(tkn.usdPrice || 0))
          // @ts-ignore
          .plus(bntAmount.times(Number(bnt.usdPrice || 0)))
          .toString();

        return {
          bnt: {
            token: {
              symbol: 'BNT',
              logoURI: ropstenImage,
              usdPrice: '0',
              decimals: 0,
              ...bnt,
            },
            amount: bntAmount.toString(),
          },
          tkn: {
            token: {
              symbol: pool.name.replace('/BNT', ''),
              logoURI: ropstenImage,
              usdPrice: '0',
              decimals: 0,
              ...tkn,
            },
            amount: tknAmount.toString(),
          },
          amount,
          value: value,
          poolDecimals: pool.decimals,
          converter: poolToken.converter,
          poolName: pool.name,
          version: pool.version,
        };
      })
    );
    return res.filter((x) => !!x);
  })
);
