import { ContractsApi } from 'services/web3/v3/contractsApi';
import {
  WithdrawalRequestRaw,
  WithdrawalSettings,
} from 'redux/portfolio/v3Portfolio.types';
import { ppmToDec } from 'utils/helperFunctions';

export const initWithdrawalV3 = async (
  poolTokenId: string,
  poolTokenAmount: string
) => {
  const res = await ContractsApi.BancorNetwork.write.initWithdrawal(
    poolTokenId,
    poolTokenAmount
  );
};

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
