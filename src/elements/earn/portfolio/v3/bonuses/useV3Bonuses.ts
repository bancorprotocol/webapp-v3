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

export const useV3Bonuses = () => {
  const account = useAppSelector((state) => state.user.account);
  const dispatch = useDispatch();
  const isBonusModalOpen = useAppSelector<boolean>(
    (state) => state.v3Portfolio.bonusesModal
  );
  const bonuses = useAppSelector(getStandardRewards);
  const isLoading = useAppSelector(getIsLoadingStandardRewards);

  const setBonusModalOpen = (state: boolean) => {
    dispatch(openBonusesModal(state));
  };

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
        const res = await ContractsApi.StandardRewards.write.claimRewards(ids);
        console.log('Claimed', res);
        await updatePortfolioData(dispatch, account);
      } catch (e: any) {
        console.error('failed to claim rewards', e);
      }
    },
    [account, dispatch]
  );

  const handleClaimAndEarn = useCallback(
    async (ids: string[]) => {
      if (!account) {
        console.error('No account, please connect wallet');
        return;
      }
      try {
        const res = await ContractsApi.StandardRewards.write.stakeRewards(ids);
        console.log('restaked', res);
        await updatePortfolioData(dispatch, account);
      } catch (e: any) {
        console.error('failed to restake rewards', e);
      }
    },
    [account, dispatch]
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
