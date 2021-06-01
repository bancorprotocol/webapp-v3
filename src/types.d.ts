import { Contract } from 'web3-eth-contract';

export type EthAddress = string;

export interface ContractMethods<T> extends Contract {
  methods: T;
}

export enum EthNetworks {
  Mainnet = 1,
  Ropsten = 3,
  Rinkeby = 4,
  Goerli = 5,
}

export interface RegisteredContracts {
  BancorNetwork: string;
  BancorConverterRegistry: string;
  LiquidityProtection: string;
  LiquidityProtectionStore: string;
  StakingRewards: string;
}
