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
import { utils } from 'ethers';
import { RegisteredContracts } from 'services/web3/types';
import { Observable } from 'rxjs';
import {
  ContractRegistry__factory,
  LiquidityProtection__factory,
} from 'services/web3/abis/types';
import { web3 } from 'services/web3';
import { EthNetworkVariables } from 'services/web3/config';

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
  switchMapIgnoreThrow((networkVariables) =>
    fetchContractAddresses(networkVariables)
  ),
  distinctUntilChanged<RegisteredContracts>(isEqual),
  shareReplay(1)
);
const fetchContractAddresses = async (
  networkVariables: EthNetworkVariables
): Promise<RegisteredContracts> => {
  const contract = ContractRegistry__factory.connect(
    networkVariables.contractRegistry,
    web3
  );

  try {
    const addresses = await Promise.all([
      contract.addressOf(utils.formatBytes32String('BancorNetwork')),
      contract.addressOf(utils.formatBytes32String('BancorConverterRegistry')),
      contract.addressOf(utils.formatBytes32String('LiquidityProtectionStore')),
      contract.addressOf(utils.formatBytes32String('LiquidityProtection')),
      contract.addressOf(utils.formatBytes32String('StakingRewards')),
    ]);

    return {
      BancorNetwork: addresses[0],
      BancorConverterRegistry: addresses[1],
      LiquidityProtectionStore: addresses[2],
      LiquidityProtection: addresses[3],
      StakingRewards: addresses[4],
    };
  } catch (error) {
    return {
      BancorNetwork: '',
      BancorConverterRegistry: '',
      LiquidityProtectionStore: '',
      LiquidityProtection: '',
      StakingRewards: '',
    };
  }
};

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
  switchMap(async (liquidityProtection) => {
    const contract = LiquidityProtection__factory.connect(
      liquidityProtection,
      web3
    );
    try {
      return await contract.store();
    } catch (error) {}

    return '';
  }),
  map(utils.getAddress),
  distinctUntilChanged(),
  shareReplay(1)
);

export const settingsContractAddress$ = liquidityProtection$.pipe(
  switchMap(async (liquidityProtection) => {
    const contract = LiquidityProtection__factory.connect(
      liquidityProtection,
      web3
    );
    try {
      return await contract.settings();
    } catch (error) {}

    return '';
  }),
  map(utils.getAddress),
  optimisticContract('LiquiditySettings'),
  shareReplay(1)
);

export const govTokenAddress$ = networkVars$.pipe(
  pluck('govToken'),
  map(utils.getAddress),
  shareReplay(1)
);
