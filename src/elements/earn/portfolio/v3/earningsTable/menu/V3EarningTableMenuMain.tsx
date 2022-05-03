import { memo, useCallback } from 'react';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { prettifyNumber } from 'utils/helperFunctions';
import { ReactComponent as IconChevronRight } from 'assets/icons/chevronRight.svg';
import { EarningTableMenuState } from 'elements/earn/portfolio/v3/earningsTable/menu/V3EarningTableMenu';
import { useV3Bonuses } from 'elements/earn/portfolio/v3/bonuses/useV3Bonuses';
import { Holding } from 'store/portfolio/v3Portfolio.types';
import { shrinkToken } from 'utils/formulas';
import { useAppSelector } from 'store';
import { getTokenById } from 'store/bancor/bancor';

interface Props {
  setCurrentMenu: (menu: EarningTableMenuState) => void;
  setIsWithdrawModalOpen: (isOpen: boolean) => void;
  setHoldingToWithdraw: (holding: Holding) => void;
  holding: Holding;
}

export const V3EarningTableMenuMain = memo(
  ({
    holding,
    setHoldingToWithdraw,
    setCurrentMenu,
    setIsWithdrawModalOpen,
  }: Props) => {
    const { setBonusModalOpen } = useV3Bonuses();
    const { standardStakingReward } = holding;

    const rewardsToken = useAppSelector((state) =>
      getTokenById(state, holding.standardStakingReward?.rewardsToken || '')
    );

    const handleWithdrawClick = useCallback(() => {
      setHoldingToWithdraw(holding);
      setIsWithdrawModalOpen(true);
    }, [holding, setHoldingToWithdraw, setIsWithdrawModalOpen]);

    const handleBonusClick = useCallback(() => {
      setBonusModalOpen(true);
      // TODO - add logic for what action to perform
      // if (true) {
      //
      // } else {
      //   setCurrentMenu('bonus');
      // }
    }, [setBonusModalOpen]);

    return (
      <div className="flex flex-col justify-between h-full">
        <div className="space-y-20">
          <div className="flex space-x-20">
            <Button
              variant={ButtonVariant.SECONDARY}
              size={ButtonSize.SMALL}
              className="w-full"
              textBadge={`${holding.pool.apr.toFixed(2)}%`}
            >
              Deposit
            </Button>
            <Button
              variant={ButtonVariant.SECONDARY}
              size={ButtonSize.SMALL}
              onClick={handleWithdrawClick}
              className="w-full"
            >
              Withdraw
            </Button>
          </div>
          <button
            onClick={handleBonusClick}
            className="flex justify-between w-full"
          >
            <span>Bonus gain</span>
            <span className="text-secondary flex items-center">
              {prettifyNumber(
                shrinkToken(
                  standardStakingReward?.pendingRewardsWei || 0,
                  rewardsToken?.decimals || 0
                )
              )}{' '}
              {rewardsToken?.symbol}
              <IconChevronRight className="w-16 ml-5" />
            </span>
          </button>

          <button
            onClick={() => setCurrentMenu('rate')}
            className="flex justify-between w-full"
          >
            <span>Standard Rewards</span>
            <span className="text-secondary flex items-center">
              <IconChevronRight className="w-16 ml-5" />
            </span>
          </button>
        </div>

        <hr className="border-silver dark:border-grey" />

        <div className="flex flex-col items-start space-y-14 text-12 text-secondary">
          <button>Buy ETH with Fiat</button>
          <button>View Contract</button>
          <button>Display token on Metamask</button>
        </div>
      </div>
    );
  }
);
