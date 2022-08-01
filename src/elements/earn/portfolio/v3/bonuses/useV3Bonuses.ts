import { useAppSelector } from 'store';
import { useDispatch } from 'react-redux';
import {
  getIsLoadingStandardRewards,
  getStandardRewards,
  openBonusesModal,
} from 'store/portfolio/v3Portfolio';
import { useCallback, useMemo } from 'react';
import BigNumber from 'bignumber.js';
import { shrinkToken } from 'utils/formulas';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { updatePortfolioData } from 'services/web3/v3/portfolio/helpers';
import {
  confirmClaimNotification,
  genericFailedNotification,
  rejectNotification,
} from 'services/notifications/notifications';
import { ErrorCode } from 'services/web3/types';
import {
  sendWithdrawBonusEvent,
  WithdrawBonusEvent,
} from 'services/api/googleTagManager/withdraw';

export const useV3Bonuses = () => {
  const account = useAppSelector((state) => state.user.account);
  const dispatch = useDispatch();
  const isBonusModalOpen = useAppSelector<boolean>(
    (state) => state.v3Portfolio.bonusesModal
  );
  const bonuses = useAppSelector(getStandardRewards);
  const isLoading = useAppSelector(getIsLoadingStandardRewards);

  const setBonusModalOpen = useCallback(
    (state: boolean) => {
      dispatch(openBonusesModal(state));
    },
    [dispatch]
  );

  const bonusUsdTotal = useMemo(
    () =>
      bonuses.reduce((acc, group) => {
        const usdPrice = group.groupPool.reserveToken.usdPrice;
        const usdAmount = new BigNumber(
          shrinkToken(group.totalPendingRewards, group.groupPool.decimals)
        ).times(usdPrice);
        return usdAmount.plus(acc).toNumber();
      }, 0),
    [bonuses]
  );

  const handleClaim = useCallback(
    async (ids: string[]) => {
      if (!account) {
        console.error('No account, please connect wallet');
        return;
      }
      try {
        sendWithdrawBonusEvent(WithdrawBonusEvent.ClaimClick);
        sendWithdrawBonusEvent(WithdrawBonusEvent.WalletRequest);
        const tx = await ContractsApi.StandardRewards.write.claimRewards(ids);
        sendWithdrawBonusEvent(WithdrawBonusEvent.WalletConfirm);
        confirmClaimNotification(dispatch, tx.hash);
        setBonusModalOpen(false);
        await tx.wait();
        sendWithdrawBonusEvent(
          WithdrawBonusEvent.Success,
          undefined,
          undefined,
          tx.hash
        );
        await updatePortfolioData(dispatch);
      } catch (e: any) {
        sendWithdrawBonusEvent(WithdrawBonusEvent.Failed, undefined, e.message);
        console.error('failed to claim rewards', e);
        if (e.code === ErrorCode.DeniedTx) {
          rejectNotification(dispatch);
        } else {
          genericFailedNotification(dispatch, 'Claim rewards failed');
        }
        setBonusModalOpen(false);
      }
    },
    [account, dispatch, setBonusModalOpen]
  );

  const handleClaimAndEarn = useCallback(
    async (ids: string[]) => {
      if (!account) {
        console.error('No account, please connect wallet');
        return;
      }
      try {
        const tx = await ContractsApi.StandardRewards.write.stakeRewards(ids);
        confirmClaimNotification(dispatch, tx.hash);
        setBonusModalOpen(false);
        await tx.wait();
        await updatePortfolioData(dispatch);
      } catch (e: any) {
        console.error('failed to restake rewards', e);
        if (e.code === ErrorCode.DeniedTx) {
          rejectNotification(dispatch);
        } else {
          genericFailedNotification(dispatch, 'Restake rewards failed');
        }
        setBonusModalOpen(false);
      }
    },
    [account, dispatch, setBonusModalOpen]
  );

  return {
    bonuses,
    isBonusModalOpen,
    setBonusModalOpen,
    handleClaim,
    handleClaimAndEarn,
    bonusUsdTotal,
    isLoading,
  };
};
