import { combineLatest } from 'rxjs';
import { fifteenSeconds$ } from 'services/observables/timers';
import { switchMapIgnoreThrow } from 'services/observables/customOperators';
import { distinctUntilChanged, pluck, shareReplay } from 'rxjs/operators';
import { isEqual } from 'lodash';
import { BancorApi } from 'services/api/bancorApi/bancorApi';
import {
  APIBntV3,
  APIPoolV3,
  APITokenV3,
  WelcomeData,
} from 'services/api/bancorApi/bancorApi.types';

export const apiData$ = combineLatest([fifteenSeconds$]).pipe(
  switchMapIgnoreThrow(() => BancorApi.v2.getWelcome()),
  distinctUntilChanged<WelcomeData>(isEqual),
  shareReplay(1)
);

export const apiTokens$ = apiData$.pipe(
  pluck('tokens'),
  distinctUntilChanged<WelcomeData['tokens']>(isEqual),
  shareReplay(1)
);

export const apiPools$ = apiData$.pipe(
  pluck('pools'),
  distinctUntilChanged<WelcomeData['pools']>(isEqual),
  shareReplay(1)
);

export const apiTokensV3$ = combineLatest([fifteenSeconds$]).pipe(
  switchMapIgnoreThrow(() => BancorApi.v3.getTokens()),
  distinctUntilChanged<APITokenV3[]>(isEqual),
  shareReplay(1)
);

export const apiBntV3$ = combineLatest([fifteenSeconds$]).pipe(
  switchMapIgnoreThrow(() => BancorApi.v3.getBnt()),
  distinctUntilChanged<APIBntV3>(isEqual),
  shareReplay(1)
);

export const apiPoolsV3$ = combineLatest([apiBntV3$]).pipe(
  switchMapIgnoreThrow(async ([apiBnt]) => {
    const bntPool: APIPoolV3 = {
      poolDltId: '0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C',
      poolTokenDltId: '0xAB05Cf7C6c3a288cd36326e4f7b8600e7268E344',
      name: 'BNT',
      decimals: 18,
      tradingLiquidityTKN: {
        ...apiBnt.tradingLiquidity,
        tkn: apiBnt.tradingLiquidity.bnt,
      },
      tradingLiquidityBNT: {
        ...apiBnt.tradingLiquidity,
        tkn: apiBnt.tradingLiquidity.bnt,
      },
      volume24h: { ...apiBnt.volume24h, tkn: apiBnt.volume24h.bnt },
      fees24h: { ...apiBnt.fees24h, tkn: apiBnt.fees24h.bnt },
      stakedBalance: { ...apiBnt.stakedBalance, tkn: apiBnt.stakedBalance.bnt },
      tradingFeePPM: '20000',
      standardRewardsClaimed24h: {
        bnt: '3.496860052282084843',
        usd: '7.081141',
        eur: '6.720965',
        eth: '0.002493610903282354',
        tkn: '3.499374188239432901',
      },
      standardRewardsStaked: {
        bnt: '3.496860052282084843',
        usd: '7.081141',
        eur: '6.720965',
        eth: '0.002493610903282354',
        tkn: '3.499374188239432901',
      },
      autoCompoundingRewards24h: {
        bnt: '3.496860052282084843',
        usd: '7.081141',
        eur: '6.720965',
        eth: '0.002493610903282354',
        tkn: '3.499374188239432901',
      },
    };
    return [...(await BancorApi.v3.getPools()), bntPool];
  }),
  distinctUntilChanged<APIPoolV3[]>(isEqual),
  shareReplay(1)
);
