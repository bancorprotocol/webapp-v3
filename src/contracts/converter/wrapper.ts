import Web3 from 'web3';
import { CallReturn } from 'eth-multicall';
import { ContractSendMethod } from 'web3-eth-contract';
import { ContractMethods } from 'types';
import { buildContract } from 'contracts';
import { ABIConverter } from './abi';

export const buildConverterContract = (
  contractAddress?: string,
  web3?: Web3
): ContractMethods<{
  acceptTokenOwnership: () => ContractSendMethod;
  reserves: (reserveAddress: string) => CallReturn<any[]>;
  reserveBalance: (reserveAddress: string) => CallReturn<string>;
  getConnectorBalance: (reserveAddress: string) => CallReturn<string>;
  getReserveBalance: (reserveAdress: string) => CallReturn<string>;
  acceptOwnership: () => ContractSendMethod;
  fund: (fundAmount: string) => ContractSendMethod;
  liquidate: (fundAmount: string) => ContractSendMethod;
  setConversionFee: (ppm: string) => ContractSendMethod;
  addReserve: (
    reserveAddress: string,
    connectorWeight: number
  ) => ContractSendMethod;
  getSaleReturn: (
    toAddress: string,
    wei: string
  ) => CallReturn<{ '0': string; '1': string }>;
  getReturn: (
    fromTokenAddress: string,
    toTokenAddress: string,
    wei: string
  ) => CallReturn<{ '0': string; '1': string }>;
  owner: () => CallReturn<string>;
  version: () => CallReturn<string>;
  connectorTokenCount: () => CallReturn<string>;
  connectorTokens: (index: number) => CallReturn<string>;
  conversionFee: () => CallReturn<string>;
  geometricMean: (weis: string[]) => CallReturn<string>;
}> => buildContract(ABIConverter, contractAddress, web3);
