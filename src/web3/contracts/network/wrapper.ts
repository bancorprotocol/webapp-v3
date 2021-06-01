import { CallReturn } from 'eth-multicall';
import { ContractMethods } from 'web3/types';
import { ContractSendMethod } from 'web3-eth-contract';
import Web3 from 'web3';
import { buildContract } from 'web3/contracts';
import { ABINetworkContract } from 'web3/contracts/network/abi';

export const buildNetworkContract = (
  contractAddress: string,
  web3?: Web3
): ContractMethods<{
  rateByPath: (path: string[], amount: string) => CallReturn<string>;
  convertByPath: (
    path: string[],
    amount: string,
    minReturn: string,
    beneficiary: string,
    affiliateAccount: string,
    affiliateFee: number
  ) => ContractSendMethod;
  conversionPath: (
    sourceToken: string,
    destinationToken: string
  ) => CallReturn<string[]>;
}> => buildContract(ABINetworkContract, contractAddress, web3);

export const getReturnByPath = async ({
  networkContract,
  path,
  amount,
  web3,
}: {
  networkContract: string;
  path: string[];
  amount: string;
  web3: Web3;
}): Promise<string> => {
  const contract = buildNetworkContract(networkContract, web3);
  return contract.methods.rateByPath(path, amount).call();
};

export const conversionPath = async ({
  networkContractAddress,
  from,
  to,
  web3,
}: {
  networkContractAddress: string;
  from: string;
  to: string;
  web3: Web3;
}) => {
  const networkContract = buildNetworkContract(networkContractAddress, web3);
  return networkContract.methods.conversionPath(from, to).call();
};
