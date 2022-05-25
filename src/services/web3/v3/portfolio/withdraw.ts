import { ContractsApi } from 'services/web3/v3/contractsApi';
import {
  WithdrawalRequest,
  WithdrawalRequestRaw,
  WithdrawalSettings,
} from 'store/portfolio/v3Portfolio.types';
import { ppmToDec } from 'utils/helperFunctions';
import BigNumber from 'bignumber.js';
import { expandToken } from 'utils/formulas';

export const fetchPortfolioV3WithdrawalSettings =
  async (): Promise<WithdrawalSettings> => {
    const lockDuration =
      await ContractsApi.PendingWithdrawals.read.lockDuration();
    const withdrawalFeePPM =
      await ContractsApi.NetworkSettings.read.withdrawalFeePPM();
    const withdrawalFee = ppmToDec(withdrawalFeePPM).toNumber();

    return { lockDuration, withdrawalFee };
  };

export const fetchPortfolioV3Withdrawals = async (
  user: string
): Promise<WithdrawalRequestRaw[]> => {
  const withdrawalRequestIds =
    await ContractsApi.PendingWithdrawals.read.withdrawalRequestIds(user);

  const withdrawalRequests = await Promise.all(
    withdrawalRequestIds.map(
      async (id) =>
        await ContractsApi.PendingWithdrawals.read.withdrawalRequest(id)
    )
  );

  return withdrawalRequests.map((request, idx) => ({
    id: withdrawalRequestIds[idx].toNumber(),
    provider: request.provider,
    poolToken: request.poolToken,
    reserveToken: request.reserveToken,
    createdAt: request.createdAt,
    poolTokenAmountWei: request.poolTokenAmount.toString(),
    reserveTokenAmountWei: request.reserveTokenAmount.toString(),
  }));
};

export const fetchWithdrawalRequestOutputBreakdown = async (
  req: WithdrawalRequest
): Promise<{ tkn: number; bnt: number }> => {
  try {
    const res = await ContractsApi.BancorNetworkInfo.read.withdrawalAmounts(
      req.reserveToken,
      expandToken(req.poolTokenAmount, req.pool.reserveToken.decimals)
    );
    const tkn = new BigNumber(res.baseTokenAmount.toString())
      .div(res.totalAmount.toString())
      .times(100)
      .toNumber();
    const bnt = new BigNumber(100).minus(tkn).toNumber();
    return {
      tkn,
      bnt,
    };
  } catch (e) {
    console.error('failed to fetch output distribution: ', e);
    throw e;
  }
};
