export type EthAddress = string;

export enum EthNetworks {
  Mainnet = 1,
  Ropsten = 3,
}

export enum ErrorCode {
  DeniedTx = 4001,
}

export enum SignatureType {
  EIP712 = 2,
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
