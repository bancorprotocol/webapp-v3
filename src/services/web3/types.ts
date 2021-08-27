import { Token } from 'services/observables/tokens';
import { Contract } from 'web3-eth-contract';

export type EthAddress = string;

export interface ContractMethods<T> extends Contract {
  methods: T;
}

export enum EthNetworks {
  Mainnet = 1,
  Ropsten = 3,
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

export interface TokenAndAmount {
  decAmount: string;
  token: Token;
}
