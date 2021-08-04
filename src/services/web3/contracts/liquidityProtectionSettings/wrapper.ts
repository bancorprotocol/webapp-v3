import { CallReturn } from 'eth-multicall';
import { ContractMethods } from 'services/web3/types';
import Web3 from 'web3';
import { buildContract } from '..';
import { ABILiquidityProtectionSettings } from './abi';

export const buildLiquidityProtectionSettingsContract = (
  contractAddress: string,
  web3?: Web3
): ContractMethods<{
  poolWhitelist(): CallReturn<string[]>;
  addLiquidityDisabled: (
    poolId: string,
    reserveId: string
  ) => CallReturn<boolean>;
  minProtectionDelay: () => CallReturn<string>;
  lockDuration: () => CallReturn<string>;
  networkToken: () => CallReturn<string>;
  maxProtectionDelay: () => CallReturn<string>;
  maxSystemNetworkTokenRatio: () => CallReturn<string>;
  defaultNetworkTokenMintingLimit: () => CallReturn<string>;
  minNetworkTokenLiquidityForMinting: () => CallReturn<string>;
  networkTokensMinted: (poolId: string) => CallReturn<string>;
  networkTokenMintingLimits: (poolId: string) => CallReturn<string>;
  averageRateMaxDeviation: () => CallReturn<string>;
  isPoolWhitelisted(anchorAddress: string): CallReturn<boolean>;
}> => buildContract(ABILiquidityProtectionSettings, contractAddress, web3);

export const fetchWhiteListedV1Pools = async (
  liquidityProtectionSettingsAddress: string
) => {
  try {
    const liquidityProtection = buildLiquidityProtectionSettingsContract(
      liquidityProtectionSettingsAddress
    );
    const whitelistedPools = await liquidityProtection.methods
      .poolWhitelist()
      .call();

    return whitelistedPools;
  } catch (e) {
    throw new Error(
      `Failed fetching whitelisted pools with address ${liquidityProtectionSettingsAddress}`
    );
  }
};
