import {
  LiquidityProtection,
  LiquidityProtection__factory,
  LiquidityProtectionSettings__factory,
  LiquidityProtectionStore,
  LiquidityProtectionStore__factory,
} from 'services/web3/abis/types';
import { web3, writeWeb3 } from 'services/web3/index';
import {
  liquidityProtection$,
  liquidityProtectionStore$,
  settingsContractAddress$,
} from 'services/observables/contracts';
import { take } from 'rxjs/operators';
import { multicall } from 'services/web3/multicall/multicall';
import { keyBy, merge, values } from 'lodash';
import dayjs from 'dayjs';
import {
  calculateProgressLevel,
  calcUsdPrice,
  decToPpm,
} from 'utils/helperFunctions';
import BigNumber from 'bignumber.js';
import { Pool, Reserve } from 'services/observables/tokens';
import {
  buildProtectionDelayCall,
  buildRemoveLiquidityReturnCall,
} from 'services/web3/liquidity/liquidity';
import { shrinkToken } from 'utils/formulas';
import { fetchedPendingRewards, fetchedRewardsMultiplier } from './rewards';
import { ErrorCode } from '../types';
import { Result } from '@ethersproject/abi';
import { changeGas } from '../config';

export interface ProtectedPosition {
  positionId: string;
  pool: Pool;
  fees: string;
  initialStake: { usdAmount: string; tknAmount: string };
  protectedAmount: { usdAmount: string; tknAmount: string };
  claimableAmount: { usdAmount: string; tknAmount: string };
  reserveToken: Reserve;
  roi: {
    fees: string;
    reserveRewards?: string;
  };
  aprs: { day: string; week: string };
  rewardsMultiplier: string;
  rewardsAmount: string;
  timestamps: {
    initalStake: string;
    insuranceStart: string;
    fullCoverage: string;
  };
  currentCoveragePercent: number;
}

export interface ProtectedPositionGrouped extends ProtectedPosition {
  groupId: string;
  subRows: ProtectedPosition[];
}

export interface ProtectedLiquidity {
  id: string;
  owner: string;
  poolToken: string;
  reserveToken: Reserve;
  poolAmount: string;
  reserveAmount: string;
  reserveRateN: string;
  reserveRateD: string;
  timestamp: string;
  pool: Pool;
}

const fetchPositions = async (
  contract: LiquidityProtectionStore,
  currentUser: string,
  pools: Pool[]
): Promise<ProtectedLiquidity[]> => {
  const positionIds = await contract.protectedLiquidityIds(currentUser);
  const calls = positionIds.map((id) =>
    buildProtectedPositionCall(contract, id.toString())
  );
  const res = await multicall(calls);

  if (res)
    return res.map((r, index) => {
      const position = r as Result[];
      const poolToken = position[1].toString();
      const reserveTokenAddress = position[2].toString();
      const pool = pools.find((x) => x.pool_dlt_id === poolToken);
      const reserveToken = pool!.reserves.find(
        (reserve) => reserve.address === reserveTokenAddress
      );

      return {
        id: positionIds[index].toString(),
        owner: position[0].toString(),
        poolToken,
        reserveToken: reserveToken!,
        poolAmount: position[3].toString(),
        reserveAmount: position[4].toString(),
        reserveRateN: position[5].toString(),
        reserveRateD: position[6].toString(),
        timestamp: position[7].toString(),
        pool: pool!,
      };
    });

  return [];
};
const buildProtectedPositionCall = (
  contract: LiquidityProtectionStore,
  protectionId: string
) => {
  return {
    contractAddress: contract.address,
    interface: contract.interface,
    methodName: 'protectedLiquidity',
    methodParameters: [protectionId],
  };
};

const fetchROI = async (
  contract: LiquidityProtection,
  positions: ProtectedLiquidity[]
) => {
  const timeNow = dayjs();
  const timeNowUnix = timeNow.unix();
  const fullWaitTimeUnix = timeNow.add(1, 'year').unix();
  const portion = decToPpm(1);

  const calls = positions.map((x) => [
    buildRemoveLiquidityReturnCall(contract, x.id, portion, timeNowUnix),
    buildRemoveLiquidityReturnCall(contract, x.id, portion, fullWaitTimeUnix),
  ]);

  const res = await multicall(calls.flat());

  if (res) {
    return positions.map((position, i) => {
      const { decimals, usdPrice } = position.reserveToken;
      const index = i * 2;

      const currentTargetAmount = res[index][0].toString();
      const fullTargetAmount = res[index + 1][0].toString();

      const protectedAmount = {
        tknAmount: shrinkToken(fullTargetAmount, decimals),
        usdAmount: calcUsdPrice(fullTargetAmount, usdPrice, decimals),
      };

      const claimableAmount = {
        tknAmount: shrinkToken(currentTargetAmount, decimals),
        usdAmount: calcUsdPrice(currentTargetAmount, usdPrice, decimals),
      };

      const fees = new BigNumber(protectedAmount.tknAmount)
        .minus(shrinkToken(position.reserveAmount, decimals))
        .toString();

      const roiDec = new BigNumber(currentTargetAmount)
        .div(position.reserveAmount)
        .minus(1)
        .toString();

      return {
        id: position.id,
        roiDec,
        protectedAmount,
        claimableAmount,
        fees,
      };
    });
  }

  return [];
};

export const fetchProtectedPositions = async (
  pools: Pool[],
  currentUser: string
): Promise<ProtectedPosition[]> => {
  const liquidityProtectionSettingsContractAddress =
    await settingsContractAddress$.pipe(take(1)).toPromise();

  const liquidityProtectionSettingsContract =
    LiquidityProtectionSettings__factory.connect(
      liquidityProtectionSettingsContractAddress,
      web3.provider
    );

  const liquidityProtectionStoreContractAddress =
    await liquidityProtectionStore$.pipe(take(1)).toPromise();

  const liquidityProtectionStoreContract =
    LiquidityProtectionStore__factory.connect(
      liquidityProtectionStoreContractAddress,
      web3.provider
    );

  const liquidityProtectionContractAddress = await liquidityProtection$
    .pipe(take(1))
    .toPromise();

  const liquidityProtectionContract = LiquidityProtection__factory.connect(
    liquidityProtectionContractAddress,
    web3.provider
  );

  const rawPositions = await fetchPositions(
    liquidityProtectionStoreContract,
    currentUser,
    pools
  );

  const protectionDelay = await multicall(
    buildProtectionDelayCall(liquidityProtectionSettingsContract)
  );

  if (rawPositions.length === 0 || !protectionDelay) return [];

  const minProtectionDelay = protectionDelay[0];
  const maxProtectionDelay = protectionDelay[1];

  const positionsRoi = await fetchROI(
    liquidityProtectionContract,
    rawPositions
  );

  // const positionsAPR = await fetchPoolAprs(
  //   pools,
  //   rawPositions,
  //   liquidityProtectionContract
  // );

  const rewardsMultiplier = await fetchedRewardsMultiplier(
    currentUser,
    rawPositions
  );

  const rewardsAmount = await fetchedPendingRewards(currentUser, rawPositions);

  const positions = values(
    merge(
      keyBy(rawPositions, 'id'),
      keyBy(positionsRoi, 'id'),
      //keyBy(positionsAPR, 'id'),
      keyBy(rewardsMultiplier, 'id'),
      keyBy(rewardsAmount, 'id')
    )
  );

  const final = positions.map((position) => {
    const pool = pools.find((x) => x.pool_dlt_id === position.poolToken);
    const { decimals, usdPrice } = position.reserveToken;

    const initialStake = {
      tknAmount: shrinkToken(position.reserveAmount, decimals),
      usdAmount: calcUsdPrice(position.reserveAmount, usdPrice, decimals),
    };

    const timestamps = {
      initalStake: position.timestamp,
      insuranceStart: new BigNumber(position.timestamp)
        .plus(minProtectionDelay.toString())
        .toString(),
      fullCoverage: new BigNumber(position.timestamp)
        .plus(maxProtectionDelay.toString())
        .toString(),
    };

    const currentCoveragePercent = calculateProgressLevel(
      Number(timestamps.initalStake),
      Number(timestamps.fullCoverage)
    );

    return {
      positionId: position.id,
      pool: pool!,
      fees: position.fees,
      initialStake,
      protectedAmount: position.protectedAmount,
      claimableAmount: position.claimableAmount,
      reserveToken: position.reserveToken,
      roi: {
        fees: position.roiDec,
      },
      aprs: {
        day: '0', //position.aprDay,
        week: '0', //position.aprWeek,
      },
      rewardsMultiplier: position.rewardsMultiplier,
      rewardsAmount: position.rewardsAmount,
      timestamps,
      currentCoveragePercent,
    };
  });

  return final;
};

export const withdrawProtection = async (
  positionId: string,
  amount: string,
  tknAmount: string,
  onHash: (txHash: string) => void,
  onCompleted: Function,
  rejected: Function,
  failed: (error: string) => void
) => {
  try {
    const liquidityProtectionContractAddress = await liquidityProtection$
      .pipe(take(1))
      .toPromise();

    const liquidityProtectionContract = LiquidityProtection__factory.connect(
      liquidityProtectionContractAddress,
      writeWeb3.signer
    );

    const percentage = new BigNumber(amount).div(tknAmount);

    const estimate =
      await liquidityProtectionContract.estimateGas.removeLiquidity(
        positionId,
        decToPpm(percentage)
      );
    const gasLimit = changeGas(estimate.toString());

    const tx = await liquidityProtectionContract.removeLiquidity(
      positionId,
      decToPpm(percentage),
      { gasLimit }
    );
    onHash(tx.hash);

    await tx.wait();
    onCompleted();
  } catch (e: any) {
    console.error(e);
    if (e.code === ErrorCode.DeniedTx) rejected();
    else failed(e.message);
  }
};

export const getWithdrawBreakdown = async (
  id: string,
  amount: string,
  tknAmount: string
) => {
  const now = dayjs().unix();
  const liquidityProtectionContractAddress = await liquidityProtection$
    .pipe(take(1))
    .toPromise();

  const constract = LiquidityProtection__factory.connect(
    liquidityProtectionContractAddress,
    web3.provider
  );

  const percentage = new BigNumber(amount).div(tknAmount);

  const res = await constract.removeLiquidityReturn(
    id,
    decToPpm(percentage),
    now
  );
  const expectedAmount = res[0].toString();
  const actualAmount = res[1].toString();
  const bntAmount = res[2].toString();

  return {
    expectedAmount,
    actualAmount,
    bntAmount,
  };
};
