import { Contract } from 'web3-eth-contract';

export type EthAddress = string;

export interface ContractMethods<T> extends Contract {
  methods: T;
}

export enum EthNetworks {
  Mainnet = 1,
  Ropsten = 3,
}

export enum PoolType {
  Liquid = 0,
  Traditional = 1,
  ChainLink = 2,
}

export enum ErrorCode {
  DeniedTx = 4001,
}

export interface RegisteredContracts {
  BancorNetwork: string;
  BancorConverterRegistry: string;
  LiquidityProtection: string;
  LiquidityProtectionStore: string;
  StakingRewards: string;
}

export interface ConverterAndAnchor {
  converterAddress: string;
  anchorAddress: string;
}

export interface MinimalPool {
  anchorAddress: string;
  converterAddress: string;
  reserves: string[];
}
