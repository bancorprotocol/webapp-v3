import { CallReturn } from 'eth-multicall';
import { ContractMethods } from 'services/web3/types';
import Web3 from 'web3';
import { buildContract } from '..';
import { ABILiquidityProtectionStore } from './abi';

export const buildLiquidityProtectionStoreContract = (
  contractAddress: string,
  web3?: Web3
): ContractMethods<{
  lockedBalanceCount(owner: string): CallReturn<string>;
  lockedBalance(
    owner: string,
    index: string
  ): CallReturn<{ '0': string; '1': string }>;
  lockedBalanceRange(
    owner: string,
    startIndex: string,
    endIndex: string
  ): CallReturn<{ '0': string[]; '1': string[] }>;
  systemBalance(tokenAddress: string): CallReturn<string>;
  totalProtectedPoolAmount(poolTokenAddress: string): CallReturn<string>;
  totalProtectedReserveAmount(
    anchorAddress: string,
    reserveAddress: string
  ): CallReturn<string>;
  protectedLiquidityCount(owner: string): CallReturn<string>;
  protectedLiquidityIds(owner: string): CallReturn<string[]>;
  protectedLiquidityId(owner: string): CallReturn<string>;
  protectedLiquidity(id: string): CallReturn<{ [key: string]: string }>;
}> => buildContract(ABILiquidityProtectionStore, contractAddress, web3);
