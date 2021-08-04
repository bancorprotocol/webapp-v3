import { CallReturn } from 'eth-multicall';
import Web3 from 'web3';
import { fromPairs } from 'lodash';
import { ContractSendMethod } from 'web3-eth-contract';
import { ContractMethods, EthNetworks } from 'services/web3/types';
import { ABILiquidityProtection } from './abi';
import { buildContract } from '..';
import { buildLiquidityProtectionStoreContract } from '../swap/wrapper';
import { multi } from '../shapes';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export const buildLiquidityProtectionContract = (
  contractAddress: string,
  web3?: Web3
): ContractMethods<{
  store: () => CallReturn<string>;
  systemStore: () => CallReturn<string>;
  govToken: () => CallReturn<string>;
  isPoolSupported: (anchor: string) => CallReturn<boolean>;
  protectLiquidity: (
    anchor: string,
    poolTokenWei: string
  ) => ContractSendMethod;
  unprotectLiquidity: (dbId1: string, dbId2: string) => ContractSendMethod;
  addLiquidity: (
    anchor: string,
    reserveAddress: string,
    reserveAmountWei: string
  ) => ContractSendMethod;
  removeLiquidity: (dbId: string, ppmPercent: string) => ContractSendMethod;
  claimBalance: (startIndex: string, endIndex: string) => ContractSendMethod;
  transferLiquidity: (id: string, newProvider: string) => ContractSendMethod;
  removeLiquidityReturn: (
    id: string,
    portion: string,
    removeTimeStamp: string
  ) => CallReturn<{ '0': string; '1': string; '2': string }>;
  poolROI: (
    poolToken: string,
    reserveToken: string,
    reserveAmount: string,
    poolRateN: string,
    poolRateD: string,
    reserveRateN: string,
    reserveRateD: string
  ) => CallReturn<string>;
  settings: () => CallReturn<string>;
  poolAvailableSpace: (
    poolAnchor: string
  ) => CallReturn<{ '0': string; '1': string }>;
}> => buildContract(ABILiquidityProtection, contractAddress, web3);

export const fetchLiquidityProtectionSettingsContract = async (
  liquidityProtectionContract: string
): Promise<string> => {
  const contract = buildLiquidityProtectionContract(
    liquidityProtectionContract
  );
  return contract.methods.settings().call();
};

interface ProtectedLiquidity {
  id: string;
  owner: string;
  poolToken: string;
  reserveToken: string;
  poolAmount: string;
  reserveAmount: string;
  reserveRateN: string;
  reserveRateD: string;
  timestamp: string;
}

export const protectedPositionShape = (
  storeAddress: string,
  protectionId: string
) => {
  const contract = buildLiquidityProtectionStoreContract(storeAddress);
  return {
    positionId: protectionId,
    position: contract.methods.protectedLiquidity(protectionId),
  };
};

export const fetchPositionIds = async (
  currentUser: string,
  liquidityStore: string
) => {
  const contract = buildLiquidityProtectionStoreContract(liquidityStore);
  try {
    const positionIds = await contract.methods
      .protectedLiquidityIds(currentUser)
      .call();

    return positionIds;
  } catch (e) {
    throw new Error(`Failed fetching position ids ${e}`);
  }
};

export const fetchProtectedPositions = async (
  positionIds: string[],
  liquidityStore: string,
  currentNetwork: EthNetworks
) => {
  const shapes = positionIds.map((id) =>
    protectedPositionShape(liquidityStore, id)
  );

  const [positions] = (await multi({
    currentNetwork,
    groupsOfShapes: [shapes],
  })) as any[];

  const keys = [
    'owner',
    'poolToken',
    'reserveToken',
    'poolAmount',
    'reserveAmount',
    'reserveRateN',
    'reserveRateD',
    'timestamp',
    'id',
  ];

  const protectedLiquidity = positions
    // @ts-ignore
    .map((res) => ({ ...res.position, '8': res.positionId }))
    // @ts-ignore
    .map((res) =>
      fromPairs(keys.map((key, index) => [key, res[index]]))
    ) as ProtectedLiquidity[];

  return protectedLiquidity;
};
