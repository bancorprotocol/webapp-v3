import { APIPool, getWelcomeData, WelcomeData } from 'services/api/bancor';
import { isEqual, zip } from 'lodash';
import { combineLatest, Subject } from 'rxjs';
import {
  distinctUntilChanged,
  map,
  pluck,
  shareReplay,
  startWith,
} from 'rxjs/operators';
import {
  bancorConverterRegistry$,
  bancorNetwork$,
  settingsContractAddress$,
} from './contracts';
import { logger, switchMapIgnoreThrow } from './customOperators';
import { ConverterAndAnchor } from 'services/web3/types';
import { currentNetwork$ } from './network';
import { fifteenSeconds$ } from './timers';
import {
  getAnchors,
  getConvertersByAnchors,
} from 'services/web3/contracts/converterRegistry/wrapper';
import { web3 } from 'services/web3/contracts';
import { toChecksumAddress } from 'web3-utils';
import {
  findOrThrow,
  mapIgnoreThrown,
  updateArray,
  wait,
} from 'utils/pureFunctions';
import { getRateByPath } from 'services/web3/contracts/network/wrapper';
import { ContractSendMethod } from 'web3-eth-contract';
import { toHex } from 'web3-utils';
import { fetchWhiteListedV1Pools } from 'services/web3/contracts/liquidityProtectionSettings/wrapper';
import { expandToken, shrinkToken } from 'utils/formulas';
import { Pool } from 'services/observables/tokens';

const zipAnchorAndConverters = (
  anchorAddresses: string[],
  converterAddresses: string[]
): ConverterAndAnchor[] => {
  if (anchorAddresses.length !== converterAddresses.length)
    throw new Error(
      'was expecting as many anchor addresses as converter addresses'
    );

  const zipped = zip(anchorAddresses, converterAddresses) as [string, string][];
  return zipped.map(([anchorAddress, converterAddress]) => ({
    anchorAddress: toChecksumAddress(anchorAddress!),
    converterAddress: toChecksumAddress(converterAddress!),
  }));
};

const apiTrigger$ = new Subject<true>();
export const triggerApiCall = () => {
  apiTrigger$.next();
};

export const apiData$ = combineLatest([
  currentNetwork$,
  fifteenSeconds$,
  apiTrigger$.pipe(startWith(true)),
]).pipe(
  switchMapIgnoreThrow(([networkVersion]) => getWelcomeData(networkVersion)),
  shareReplay(1)
);

const trueAnchors$ = bancorConverterRegistry$.pipe(
  switchMapIgnoreThrow((converterRegistry) =>
    getAnchors(converterRegistry, web3)
  ),
  shareReplay(1)
);

const anchorAndConverters$ = combineLatest([
  trueAnchors$,
  bancorConverterRegistry$,
]).pipe(
  switchMapIgnoreThrow(async ([anchorAddresses, converterRegistryAddress]) => {
    const converters = await getConvertersByAnchors({
      anchorAddresses,
      converterRegistryAddress,
      web3,
    });
    const anchorsAndConverters = zipAnchorAndConverters(
      anchorAddresses,
      converters
    );
    return anchorsAndConverters;
  }),
  startWith([] as ConverterAndAnchor[]),
  shareReplay(1)
);

const apiPools$ = apiData$.pipe(
  pluck('pools'),
  distinctUntilChanged<WelcomeData['pools']>(isEqual),
  shareReplay(1)
);

export const correctedPools$ = combineLatest([
  apiPools$,
  anchorAndConverters$,
]).pipe(
  map(([pools, anchorAndConverters]) => {
    if (anchorAndConverters.length === 0) return pools;
    return updateArray(
      pools,
      (pool) => {
        const correctAnchor = anchorAndConverters.find(
          (anchor) => anchor.anchorAddress === pool.pool_dlt_id
        );
        if (!correctAnchor) return false;
        return correctAnchor.converterAddress !== pool.converter_dlt_id;
      },
      (pool) => {
        const correctAnchor = anchorAndConverters.find(
          (anchor) => anchor.anchorAddress === pool.pool_dlt_id
        )!;
        return {
          ...pool,
          converter_dlt_id: correctAnchor.converterAddress,
        };
      }
    );
  }),
  logger('correctedPools', true),
  distinctUntilChanged<WelcomeData['pools']>(isEqual),
  shareReplay(1)
);

export const whitelistedPools$ = settingsContractAddress$.pipe(
  switchMapIgnoreThrow((address) => fetchWhiteListedV1Pools(address)),
  map((anchors) => anchors.map(toChecksumAddress)),
  startWith([]),
  distinctUntilChanged<string[]>(isEqual),
  shareReplay(1)
);

export const pools$ = combineLatest([correctedPools$, whitelistedPools$]).pipe(
  logger('before', true),
  map(([pools, whitelistedPools]) =>
    pools.map(
      (pool): APIPool => ({
        ...pool,
        isWhitelisted: whitelistedPools.some(
          (anchor) => pool.pool_dlt_id === anchor
        ),
      })
    )
  ),
  logger('pools$', true),
  shareReplay(1)
);
