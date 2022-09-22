import { useAppSelector } from 'store';
import { useDispatch } from 'react-redux';
import {
  getIsLoadingStandardRewards,
  getStandardRewards,
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
import { ModalNames } from 'modals';
import { popModal } from 'store/modals/modals';

export const useV3Bonuses = () => {
  const account = useAppSelector((state) => state.user.account);
  const dispatch = useDispatch();
  const bonuses = useAppSelector(getStandardRewards);
  const isLoading = useAppSelector(getIsLoadingStandardRewards);

  const closeBonusesModal = useCallback(() => {
    dispatch(popModal(ModalNames.V3Bonuses));
  }, [dispatch]);

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
        closeBonusesModal();
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
        closeBonusesModal();
      }
    },
    [account, dispatch, closeBonusesModal]
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
        closeBonusesModal();
        await tx.wait();
        await updatePortfolioData(dispatch);
      } catch (e: any) {
        console.error('failed to restake rewards', e);
        if (e.code === ErrorCode.DeniedTx) {
          rejectNotification(dispatch);
        } else {
          genericFailedNotification(dispatch, 'Restake rewards failed');
        }
        closeBonusesModal();
      }
    },
    [account, dispatch, closeBonusesModal]
  );

  return {
    bonuses,
    handleClaim,
    handleClaimAndEarn,
    bonusUsdTotal,
    isLoading,
  };
};
