import { APIPool } from 'services/api/bancor';
import { Pool, Reserve, Token } from 'services/observables/tokens';
import BigNumber from 'bignumber.js';
import { combineLatest } from 'rxjs';
import { switchMapIgnoreThrow } from 'services/observables/customOperators';
import { allTokensNew$ } from 'services/observables/v3/tokens';
import { settingsContractAddress$ } from 'services/observables/contracts';
import { LiquidityProtectionSettings__factory } from 'services/web3/abis/types';
import { web3 } from 'services/web3';
import { shrinkToken } from 'utils/formulas';
import { distinctUntilChanged, shareReplay } from 'rxjs/operators';
import { isEqual } from 'lodash';
import { apiData$ } from 'services/observables/v3/apiData';

export const buildPoolObject = (
  apiPool: APIPool,
  tkn: Token,
  bnt: Token
): Pool | undefined => {
  const liquidity = Number(apiPool.liquidity.usd ?? 0);
  const fees_24h = Number(apiPool.fees_24h.usd ?? 0);
  let apr = 0;
  if (liquidity && fees_24h) {
    apr = new BigNumber(fees_24h)
      .times(365)
      .div(liquidity)
      .times(100)
      .toNumber();
  }

  const reserveTkn = apiPool.reserves.find((r) => r.address === tkn.address);
  if (!reserveTkn) {
    return undefined;
  }
  const reserveBnt = apiPool.reserves.find((r) => r.address === bnt.address);
  if (!reserveBnt) {
    return undefined;
  }

  const reserves: Reserve[] = [
    {
      ...reserveTkn,
      rewardApr: Number(reserveTkn.apr) / 10000,
      symbol: tkn.symbol,
      logoURI: tkn.logoURI,
      decimals: tkn.decimals,
      usdPrice: tkn.usdPrice,
    },
    {
      ...reserveBnt,
      rewardApr: Number(reserveBnt.apr) / 10000,
      symbol: bnt.symbol,
      logoURI: bnt.logoURI,
      decimals: bnt.decimals,
      usdPrice: bnt.usdPrice,
    },
  ];

  return {
    name: apiPool.name,
    pool_dlt_id: apiPool.pool_dlt_id,
    converter_dlt_id: apiPool.converter_dlt_id,
    reserves,
    liquidity,
    volume_24h: Number(apiPool.volume_24h.usd ?? 0),
    fees_24h,
    fee: Number(apiPool.fee) / 10000,
    version: apiPool.version,
    supply: Number(apiPool.supply),
    decimals: apiPool.decimals,
    apr,
    reward: apiPool.reward,
    isProtected: apiPool.isWhitelisted, // TODO add isProtected by fetching minNetworkTokenLiquidityForMinting
  };
};

export const buildPoolArray = (
  apiPools: APIPool[],
  tokens: Token[]
): Pool[] => {
  const bnt = tokens.find((t) => t.symbol === 'BNT');
  if (!bnt) {
    return [];
  }
  return tokens
    .map((tkn) => {
      if (tkn.symbol === 'BNT') {
        return undefined;
      }
      const apiPool = apiPools.find((pool) => {
        return pool.reserves.find((reserve) => {
          return reserve.address === tkn.address;
        });
      });
      if (!apiPool) {
        return undefined;
      }
      return buildPoolObject(apiPool, tkn, bnt);
    })
    .filter((pool) => !!pool) as Pool[];
};

// TODO - add to pools!!!
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

export const poolsNew$ = combineLatest([apiData$, allTokensNew$]).pipe(
  switchMapIgnoreThrow(async ([apiData, allTokens]) => {
    return buildPoolArray(apiData.pools, allTokens);
  })
);
