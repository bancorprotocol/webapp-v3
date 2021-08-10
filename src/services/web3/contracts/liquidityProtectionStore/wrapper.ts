import { CallReturn } from 'eth-multicall';
import { zip } from 'lodash';
import { ContractMethods } from 'services/web3/types';
import { shrinkToken } from 'utils/pureFunctions';
import Web3 from 'web3';
import { buildContract, web3 } from '..';
import { ABILiquidityProtectionStore } from './abi';

export interface LockedBalance {
  index: number;
  amountDec: string;
  expirationTime: number;
}

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

export const traverseLockedBalances = async (
  contract: string,
  owner: string,
  expectedCount: number
): Promise<LockedBalance[]> => {
  const storeContract = buildLiquidityProtectionStoreContract(contract, web3);
  let lockedBalances: LockedBalance[] = [];

  const scopeRange = 5;
  for (let i = 0; i < 10; i++) {
    const startIndex = i * scopeRange;
    const endIndex = startIndex + scopeRange;

    const lockedBalanceRes = await storeContract.methods
      .lockedBalanceRange(owner, String(startIndex), String(endIndex))
      .call();

    const bntWeis = lockedBalanceRes['0'];
    const expirys = lockedBalanceRes['1'];

    const zipped = zip(bntWeis, expirys);
    const withIndex = zipped.map(
      ([bntWei, expiry], index) =>
        ({
          amountDec: shrinkToken(bntWei!, 18),
          expirationTime: Number(expiry),
          index: index + startIndex,
        } as LockedBalance)
    );
    lockedBalances = lockedBalances.concat(withIndex);
    if (lockedBalances.length >= expectedCount) break;
  }

  return lockedBalances;
};

export const fetchLockedBalances = async (
  storeAddress: string,
  currentUser: string
): Promise<LockedBalance[]> => {
  const owner = currentUser;

  const contractAddress = storeAddress;
  const storeContract = buildLiquidityProtectionStoreContract(contractAddress);
  const lockedBalanceCount = Number(
    await storeContract.methods.lockedBalanceCount(owner).call()
  );

  const lockedBalances =
    lockedBalanceCount > 0
      ? await traverseLockedBalances(contractAddress, owner, lockedBalanceCount)
      : [];
  return lockedBalances;
};
