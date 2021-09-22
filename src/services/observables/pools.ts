import { getWelcomeData, WelcomeData } from 'services/api/bancor';
import { isEqual, zip } from 'lodash';
import { combineLatest } from 'rxjs';
import {
  distinctUntilChanged,
  map,
  pluck,
  shareReplay,
  startWith,
} from 'rxjs/operators';
import { ConverterAndAnchor } from 'services/web3/types';
import { bancorConverterRegistry$ } from './contracts';
import { switchMapIgnoreThrow } from './customOperators';
import { currentNetwork$ } from './network';
import { fifteenSeconds$ } from './timers';
import {
  getAnchors,
  getConvertersByAnchors,
} from 'services/web3/contracts/converterRegistry/wrapper';
import { web3 } from 'services/web3/contracts';
import { toChecksumAddress } from 'web3-utils';
import { updateArray } from 'utils/pureFunctions';

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

export const apiData$ = combineLatest([currentNetwork$, fifteenSeconds$]).pipe(
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
  distinctUntilChanged<WelcomeData['pools']>(isEqual),
  shareReplay(1)
);
