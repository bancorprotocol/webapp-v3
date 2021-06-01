import { buildContract } from 'web3/contracts';
import { ContractMethods } from 'web3/types';
import { ContractSendMethod } from 'web3-eth-contract';
import { ABIExchangeProxy } from 'web3/contracts/exchangeProxy/abi';

export interface StringRfq {
  makerToken: string;
  takerToken: string;
  makerAmount: string;
  takerAmount: string;
  maker: string;
  taker: string;
  txOrigin: string;
  pool: string;
  expiry: string;
  salt: string;
}

export const buildExchangeProxyContract = (
  contractAddress: string
): ContractMethods<{
  cancelRfqOrder: (order: StringRfq) => ContractSendMethod;
  batchCancelRfqOrders: (orders: StringRfq[]) => ContractSendMethod;
}> => buildContract(ABIExchangeProxy, contractAddress);
