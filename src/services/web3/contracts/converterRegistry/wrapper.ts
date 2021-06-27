import { CallReturn } from 'eth-multicall';
import Web3 from 'web3';
import { ContractMethods } from 'services/web3/types';
import { ContractSendMethod } from 'web3-eth-contract';
import { ABIConverterRegistry } from './abi';
import { buildContract } from '..';

export const buildRegistryContract = (
  contractAddress: string,
  web3?: Web3
): ContractMethods<{
  getConvertibleTokens: () => CallReturn<string[]>;
  getConvertibleTokenAnchors: (
    convertibleToken: string
  ) => CallReturn<string[]>;
  getConvertersByAnchors: (anchors: string[]) => CallReturn<string[]>;
  getAnchors: () => CallReturn<string[]>;
  newConverter: (
    type: number,
    smartTokenName: string,
    smartTokenSymbol: string,
    smartTokenDecimals: number,
    maxConversionFee: number,
    reserveTokens: string[],
    reserveWeights: string[]
  ) => ContractSendMethod;
  getLiquidityPoolByConfig: (
    type: number,
    reserveTokens: string[],
    reserveWeight: string[]
  ) => CallReturn<string>;
}> => buildContract(ABIConverterRegistry, contractAddress, web3);

export const getAnchors = async (
  converterRegistryAddress: string,
  web3: Web3
) => {
  const registryContract = buildRegistryContract(
    converterRegistryAddress,
    web3
  );
  return registryContract.methods.getAnchors().call();
};

export const getConvertersByAnchors = async ({
  anchorAddresses,
  converterRegistryAddress,
  web3,
}: {
  anchorAddresses: string[];
  converterRegistryAddress: string;
  web3: Web3;
}) => {
  const registryContract = buildRegistryContract(
    converterRegistryAddress,
    web3
  );
  return registryContract.methods
    .getConvertersByAnchors(anchorAddresses)
    .call();
};
