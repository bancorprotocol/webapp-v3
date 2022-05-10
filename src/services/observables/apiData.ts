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
      poolDltId: apiBnt.poolDltId,
      poolTokenDltId: apiBnt.poolTokenDltId,
      name: apiBnt.name,
      decimals: apiBnt.decimals,
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
      standardRewardsClaimed24h: {
        ...apiBnt.standardRewardsClaimed24h,
        tkn: apiBnt.standardRewardsClaimed24h.bnt,
      },
      standardRewardsStaked: {
        ...apiBnt.standardRewardsStaked,
        tkn: apiBnt.standardRewardsStaked.bnt,
      },
      standardRewardsProviderJoined: {
        bnt: '0',
        usd: '0',
        eur: '0',
        eth: '0',
        tkn: '0',
      },
      standardRewardsProviderLeft: {
        bnt: '0',
        usd: '0',
        eur: '0',
        eth: '0',
        tkn: '0',
      },
    };
    return [...(await BancorApi.v3.getPools()), bntPool];
  }),
  distinctUntilChanged<APIPoolV3[]>(isEqual),
  shareReplay(1)
);
