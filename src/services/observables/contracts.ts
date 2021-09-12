import { fetchContractAddresses } from 'services/web3/contracts/addressLookup/wrapper';
import { optimisticContract, switchMapIgnoreThrow } from './customOperators';
import { currentNetwork$, networkVars$ } from './network';
import {
  distinctUntilChanged,
  map,
  pluck,
  shareReplay,
  switchMap,
} from 'rxjs/operators';
import { isEqual } from 'lodash';
import { getContractAddressesForChainOrThrow } from '@0x/contract-addresses';
import {
  buildLiquidityProtectionContract,
  fetchLiquidityProtectionSettingsContract,
} from 'services/web3/contracts/liquidityProtection/wrapper';
import { utils } from 'ethers';
import { RegisteredContracts } from 'services/web3/types';
import { Observable } from 'rxjs';

const zeroXContracts$ = currentNetwork$.pipe(
  switchMapIgnoreThrow(async (currentNetwork) =>
    getContractAddressesForChainOrThrow(currentNetwork as number)
  )
);

export const exchangeProxy$ = zeroXContracts$.pipe(
  pluck('exchangeProxy'),
  map(utils.getAddress),
  shareReplay(1)
);

export const contractAddresses$ = networkVars$.pipe(
  switchMap((networkVariables) => {
    return fetchContractAddresses(networkVariables);
  }),
  distinctUntilChanged<RegisteredContracts>(isEqual),
  shareReplay(1)
);

const pluckAndCache =
  (key: keyof RegisteredContracts) =>
  (contractsObj$: Observable<RegisteredContracts>) =>
    contractsObj$.pipe(
      pluck(key),
      map(utils.getAddress),
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
  map((liquidityProtection) => {
    const contract = buildLiquidityProtectionContract(liquidityProtection);
    return contract.methods.store().call();
  }),
  map(utils.getAddress),
  distinctUntilChanged(),
  shareReplay(1)
);

export const settingsContractAddress$ = liquidityProtection$.pipe(
  switchMapIgnoreThrow((protectionAddress) =>
    fetchLiquidityProtectionSettingsContract(protectionAddress)
  ),
  map(utils.getAddress),
  optimisticContract('LiquiditySettings'),
  shareReplay(1)
);

export const govTokenAddress$ = networkVars$.pipe(
  pluck('govToken'),
  map(utils.getAddress),
  shareReplay(1)
);
