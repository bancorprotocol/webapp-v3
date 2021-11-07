import { switchMapIgnoreThrow } from './customOperators';
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
import { Contract, utils } from 'ethers';
import { RegisteredContracts } from 'services/web3/types';
import {
  ContractRegistry__factory,
  LiquidityProtection__factory,
} from 'services/web3/abis/types';
import { web3 } from 'services/web3';
import { EthNetworkVariables } from 'services/web3/config';
import { multicall } from 'services/web3/multicall/multicall';

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
    web3.provider
  );

  try {
    const addresses = await multicall([
      buildAddressCall(contract, 'BancorNetwork'),
      buildAddressCall(contract, 'BancorConverterRegistry'),
      buildAddressCall(contract, 'LiquidityProtectionStore'),
      buildAddressCall(contract, 'LiquidityProtection'),
      buildAddressCall(contract, 'StakingRewards'),
    ]);

    if (addresses)
      return {
        BancorNetwork: addresses[0].toString(),
        BancorConverterRegistry: addresses[1].toString(),
        LiquidityProtectionStore: addresses[2].toString(),
        LiquidityProtection: addresses[3].toString(),
        StakingRewards: addresses[4].toString(),
      };
  } catch (error) {
    console.error(error);
  }
  return {
    BancorNetwork: '',
    BancorConverterRegistry: '',
    LiquidityProtectionStore: '',
    LiquidityProtection: '',
    StakingRewards: '',
  };
};

const buildAddressCall = (registry: Contract, contract: string) => ({
  contractAddress: registry.address,
  interface: registry.interface,
  methodName: 'addressOf',
  methodParameters: [utils.formatBytes32String(contract)],
});

export const bancorNetwork$ = contractAddresses$.pipe(pluck('BancorNetwork'));

export const liquidityProtection$ = contractAddresses$.pipe(
  pluck('LiquidityProtection')
);

export const bancorConverterRegistry$ = contractAddresses$.pipe(
  pluck('BancorConverterRegistry')
);

export const stakingRewards$ = contractAddresses$.pipe(pluck('StakingRewards'));

export const liquidityProtectionStore$ = liquidityProtection$.pipe(
  switchMap(async (liquidityProtection) => {
    const contract = LiquidityProtection__factory.connect(
      liquidityProtection,
      web3.provider
    );
    try {
      return await contract.store();
    } catch (error) {
      console.error(error);
    }

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
      web3.provider
    );

    try {
      return utils.getAddress(await contract.settings());
    } catch (error) {
      console.error(error);
    }

    return '';
  }),
  shareReplay(1)
);

export const systemStoreAddress$ = liquidityProtection$.pipe(
  switchMap(async (liquidityProtection) => {
    const contract = LiquidityProtection__factory.connect(
      liquidityProtection,
      web3.provider
    );

    try {
      return utils.getAddress(await contract.systemStore());
    } catch (error) {
      console.error(error);
    }

    return '';
  }),
  shareReplay(1)
);
