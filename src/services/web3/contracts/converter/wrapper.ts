import Web3 from 'web3';
import { CallReturn } from 'eth-multicall';
import { ContractSendMethod } from 'web3-eth-contract';
import { ContractMethods } from 'services/web3/types';
import { buildContract, writeWeb3 } from 'services/web3/contracts';
import {
  ABIConverter,
  ABIConverterV28,
} from 'services/web3/contracts/converter/abi';
import { Token } from 'services/observables/tokens';
import { take } from 'rxjs/operators';
import { user$ } from 'services/observables/user';
import { expandToken } from 'utils/formulas';
import { ethToken } from 'services/web3/config';
import { resolveTxOnConfirmation } from 'services/web3/index';

export const buildConverterContract = (
  contractAddress?: string,
  web3?: Web3
): ContractMethods<{
  addLiquidity: (
    reserveTokens: string[],
    reserveAmounts: string[],
    minReturn: string
  ) => ContractSendMethod;
  reserveBalances: () => CallReturn<any>;
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

export const buildV28ConverterContract = (
  contractAddress?: string,
  web3?: Web3
): ContractMethods<{
  acceptTokenOwnership: () => ContractSendMethod;
  acceptOwnership: () => ContractSendMethod;
  setConversionFee: (ppm: number) => ContractSendMethod;
  addLiquidity: (
    reserveTokens: string[],
    reserveAmounts: string[],
    minReturn: string
  ) => ContractSendMethod;
  removeLiquidity: (
    amount: string,
    reserveTokens: string[],
    reserveMinReturnAmounts: string[]
  ) => ContractSendMethod;
  addReserve: (
    reserveAddress: string,
    connectorWeight: number
  ) => ContractSendMethod;
  getReturn: (
    fromTokenAddress: string,
    toTokenAddress: string,
    wei: string
  ) => CallReturn<{ '0': string; '1': string }>;
  rateAndFee: (
    fromTokenAddress: string,
    toTokenAddress: string,
    wei: string
  ) => CallReturn<{ '0': string; '1': string }>;
  recentAverageRate: (
    tokenAddress: string
  ) => CallReturn<{ '0': string; '1': string }>;
  owner: () => CallReturn<string>;
  version: () => CallReturn<string>;
  converterType: () => CallReturn<string>;
  connectorTokenCount: () => CallReturn<string>;
  connectorTokens: (index: number) => CallReturn<string>;
  conversionFee: () => CallReturn<string>;
  reserveBalance: (reserveToken: string) => CallReturn<string>;
}> => buildContract(ABIConverterV28, contractAddress, web3);

export const addLiquidity = async (
  data: { token: Token; amount: string }[],
  converterAddress: string
) => {
  const contract = buildConverterContract(converterAddress, writeWeb3);
  const USER = await user$.pipe(take(1)).toPromise();

  const amountsWei = data.map((item) => ({
    address: item.token.address,
    weiAmount: expandToken(item.amount, item.token.decimals),
  }));

  const ethAmount = amountsWei.find((amount) => amount.address === ethToken);
  const value = ethAmount?.weiAmount;

  return resolveTxOnConfirmation({
    tx: contract.methods.addLiquidity(
      amountsWei.map(({ address }) => address),
      amountsWei.map(({ weiAmount }) => weiAmount),
      '1'
    ),
    user: USER,
    value,
    resolveImmediately: true,
  });
};
