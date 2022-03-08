import { useAppSelector } from 'redux/index';
import { useDispatch } from 'react-redux';
import { Bonus, openBonusesModal } from 'redux/portfolio/v3Portfolio';
import { useCallback, useMemo } from 'react';
import BigNumber from 'bignumber.js';

export const useV3Bonuses = () => {
  const dispatch = useDispatch();
  const isBonusModalOpen = useAppSelector<boolean>(
    (state) => state.v3Portfolio.bonusesModal
  );
  const bonuses = useAppSelector<Bonus[]>((state) => state.v3Portfolio.bonuses);

  const setBonusModalOpen = (state: boolean) => {
    dispatch(openBonusesModal(state));
  };

  const bonusUsdTotal = useMemo(
    () =>
      bonuses
        .flatMap((b) => b.claimable)
        .reduce((acc, item) => {
          const usdPrice = item.token.usdPrice || 0;
          const usdAmount = new BigNumber(item.amount).times(usdPrice);
          return usdAmount.plus(acc).toNumber();
        }, 0),
    [bonuses]
  );

  const getItemById = useCallback(
    (id: string) => {
      const item = bonuses.find((bonus) =>
        bonus.claimable.find((item) => item.id === id)
      );
      if (!item) {
        throw new Error(`Bonus with ID: '${id}' not found`);
      }
      return item;
    },
    [bonuses]
  );

  const handleClaim = useCallback(
    async (id: string) => {
      try {
        const item = getItemById(id);
        // TODO - add claim logic
      } catch (e: any) {
        console.error(e.message);
      }
    },
    [getItemById]
  );

  const handleClaimAndEarn = useCallback(
    async (id: string) => {
      try {
        const item = getItemById(id);
        // TODO - add claim and earn logic
      } catch (e: any) {
        console.error(e.message);
      }
    },
    [getItemById]
  );

  return {
    bonuses,
    isBonusModalOpen,
    setBonusModalOpen,
    handleClaim,
    handleClaimAndEarn,
    bonusUsdTotal,
  };
};
