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

const zeroXContracts$ = supportedNetworkVersion$.pipe(
  switchMapIgnoreThrow(async (networkVersion) =>
    getContractAddressesForChainOrThrow(networkVersion as number)
  )
);

export const exchangeProxy$ = zeroXContracts$.pipe(
  pluck('exchangeProxy'),
  shareReplay(1)
);

export const contractAddresses$ = networkVars$.pipe(
  switchMapIgnoreThrow((networkVariables) => {
    return fetchContractAddresses(networkVariables.contractRegistry);
  }),
  distinctUntilChanged<RegisteredContracts>(isEqual),
  shareReplay(1)
);

export const liquidityProtection$ = contractAddresses$.pipe(
  pluck('LiquidityProtection'),
  optimisticContract('LiquidityProtection'),
  shareReplay(1)
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

export const bancorConverterRegistry$ = contractAddresses$.pipe(
  pluck('BancorConverterRegistry'),
  optimisticContract('BancorConverterRegistry'),
  shareReplay(1)
);

export const stakingRewards$ = contractAddresses$.pipe(
  pluck('StakingRewards'),
  optimisticContract('StakingRewards'),
  shareReplay(1)
);

export const settingsContractAddress$ = liquidityProtection$.pipe(
  switchMapIgnoreThrow((protectionAddress) =>
    fetchLiquidityProtectionSettingsContract(protectionAddress)
  ),
  optimisticContract('LiquiditySettings'),
  shareReplay(1)
);

export const govTokenAddress$ = networkVars$.pipe(
  pluck('govToken'),
  shareReplay(1)
);
