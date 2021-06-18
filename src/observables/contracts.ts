import { fetchContractAddresses } from 'web3/contracts/addressLookup/wrapper';
import { optimisticContract, switchMapIgnoreThrow } from './customOperators';
import { networkVars$, supportedNetworkVersion$ } from './network';
import { distinctUntilChanged, map, pluck, shareReplay } from 'rxjs/operators';
import { isEqual } from 'lodash';
import { getContractAddressesForChainOrThrow } from '@0x/contract-addresses';
import {
  buildLiquidityProtectionContract,
  fetchLiquidityProtectionSettingsContract,
} from 'web3/contracts/liquidityProtection/wrapper';
import { toChecksumAddress } from 'web3-utils';
import { RegisteredContracts } from 'web3/types';
import { Observable } from 'rxjs';

const zeroXContracts$ = supportedNetworkVersion$.pipe(
  switchMapIgnoreThrow(async (networkVersion) =>
    getContractAddressesForChainOrThrow(networkVersion as number)
  )
);

export const exchangeProxy$ = zeroXContracts$.pipe(
  pluck('exchangeProxy'),
  map(toChecksumAddress),
  shareReplay(1)
);

export const contractAddresses$ = networkVars$.pipe(
  switchMapIgnoreThrow((networkVariables) => {
    return fetchContractAddresses(networkVariables.contractRegistry);
  }),
  distinctUntilChanged<RegisteredContracts>(isEqual),
  shareReplay(1)
);

const pluckAndCache =
  (key: keyof RegisteredContracts) =>
  (contractsObj$: Observable<RegisteredContracts>) =>
    contractsObj$.pipe(
      pluck(key),
      map(toChecksumAddress),
      optimisticContract(key),
      shareReplay(1)
    );

export const bancorNetwork$ = contractAddresses$.pipe(
  pluckAndCache('BancorNetwork')
);

export const liquidityProtection$ = contractAddresses$.pipe(
  pluckAndCache('LiquidityProtection')
);

export const bancorConverterRegistry$ = contractAddresses$.pipe(
  pluckAndCache('BancorConverterRegistry')
);

export const stakingRewards$ = contractAddresses$.pipe(
  pluckAndCache('StakingRewards')
);

export const liquidityProtectionStore$ = liquidityProtection$.pipe(
  switchMapIgnoreThrow((liquidityProtection) => {
    const contract = buildLiquidityProtectionContract(liquidityProtection);
    return contract.methods.store().call();
  }),
  map(toChecksumAddress),
  distinctUntilChanged(),
  shareReplay(1)
);

export const settingsContractAddress$ = liquidityProtection$.pipe(
  switchMapIgnoreThrow((protectionAddress) =>
    fetchLiquidityProtectionSettingsContract(protectionAddress)
  ),
  map(toChecksumAddress),
  optimisticContract('LiquiditySettings'),
  shareReplay(1)
);

export const govTokenAddress$ = networkVars$.pipe(
  pluck('govToken'),
  map(toChecksumAddress),
  shareReplay(1)
);
