import { CallReturn } from 'eth-multicall';
import Web3 from 'web3';
import { fromPairs, toPairs, uniqWith } from 'lodash';
import { ContractSendMethod } from 'web3-eth-contract';
import { ContractMethods, EthNetworks } from 'services/web3/types';
import { ABILiquidityProtection } from './abi';
import { buildContract } from '..';
import { buildLiquidityProtectionStoreContract } from '../swap/wrapper';
import { multi } from '../shapes';
import dayjs from 'utils/dayjs';
import { decToPpm } from 'utils/pureFunctions';
import { BigNumber } from 'bignumber.js';

const calculateReturnOnInvestment = (
  investment: string,
  newReturn: string
): string => {
  return new BigNumber(newReturn).div(investment).minus(1).toString();
};

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

export interface ProtectedLiquidity {
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

interface PositionReturn {
  baseAmount: string;
  networkAmount: string;
  targetAmount: string;
}

export const getRemoveLiquidityReturn = async (
  protectionContract: string,
  id: string,
  ppm: string,
  removeTimestamp: number,
  web3?: Web3
): Promise<PositionReturn> => {
  const contract = buildLiquidityProtectionContract(protectionContract, web3);

  const res = await contract.methods
    .removeLiquidityReturn(id, ppm, String(removeTimestamp))
    .call();
  const keys = ['targetAmount', 'baseAmount', 'networkAmount'];
  const pairs = toPairs(res).map(([, value], index) => [keys[index], value]);

  return fromPairs(pairs) as PositionReturn;

  // targetAmount - expected return amount in the reserve token
  // baseAmount - actual return amount in the reserve token
  // networkAmount - compensation in the network token
};

interface RemoveLiquidityReturn {
  id: string;
  fullLiquidityReturn: PositionReturn;
  currentLiquidityReturn: PositionReturn;
  roiDec: string;
}

export const removeLiquidityReturn = async (
  position: ProtectedLiquidity,
  liquidityProtectionContract: string
): Promise<RemoveLiquidityReturn> => {
  const timeNow = dayjs();
  const timeNowUnix = timeNow.unix();
  const fullWaitTimeUnix = timeNow.add(1, 'year').unix();

  const portion = decToPpm(1);

  const [fullLiquidityReturn, currentLiquidityReturn] = await Promise.all([
    getRemoveLiquidityReturn(
      liquidityProtectionContract,
      position.id,
      portion,
      fullWaitTimeUnix
    ),
    getRemoveLiquidityReturn(
      liquidityProtectionContract,
      position.id,
      portion,
      timeNowUnix
    ),
  ]);

  const roiDec =
    fullLiquidityReturn &&
    calculateReturnOnInvestment(
      position.reserveAmount,
      fullLiquidityReturn.targetAmount
    );

  return {
    id: position.id,
    fullLiquidityReturn,
    currentLiquidityReturn,
    roiDec,
  };
};

export const uniquePoolReserves = (
  positions: ProtectedLiquidity[]
): { poolToken: string; reserveToken: string }[] =>
  uniqWith(
    positions,
    (a, b) => a.poolToken === b.poolToken && a.reserveToken === b.reserveToken
  ).map((position) => ({
    reserveToken: position.reserveToken,
    poolToken: position.poolToken,
  }));
