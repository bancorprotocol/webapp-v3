import { memo, useCallback } from 'react';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { prettifyNumber } from 'utils/helperFunctions';
import { ReactComponent as IconChevronRight } from 'assets/icons/chevronRight.svg';
import { EarningTableMenuState } from 'elements/earn/portfolio/v3/earningsTable/menu/V3EarningTableMenu';
import { useV3Bonuses } from 'elements/earn/portfolio/v3/bonuses/useV3Bonuses';
import { Holding } from 'store/portfolio/v3Portfolio.types';
import { shrinkToken } from 'utils/formulas';
import { ModalNames } from 'modals';
import { useDispatch } from 'react-redux';
import { pushModal } from 'store/modals/modals';

interface Props {
  setCurrentMenu: (menu: EarningTableMenuState) => void;
  setIsWithdrawModalOpen: (isOpen: boolean) => void;
  setHoldingToWithdraw: (holding: Holding) => void;
  handleDepositClick: () => void;
  holding: Holding;
}

export const V3EarningTableMenuMain = memo(
  ({
    holding,
    setHoldingToWithdraw,
    setCurrentMenu,
    setIsWithdrawModalOpen,
    handleDepositClick,
  }: Props) => {
    const { bonusUsdTotal } = useV3Bonuses();
    const { latestProgram } = holding;
    const dispatch = useDispatch();

    const handleWithdrawClick = useCallback(() => {
      setHoldingToWithdraw(holding);
      setIsWithdrawModalOpen(true);
    }, [holding, setHoldingToWithdraw, setIsWithdrawModalOpen]);

    const handleBonusClick = useCallback(() => {
      dispatch(pushModal({ modalName: ModalNames.V3Bonuses }));
      // TODO - add logic for what action to perform
      // if (true) {
      //
      // } else {
      //   setCurrentMenu('bonus');
      // }
    }, []);

    return (
      <div className="flex flex-col justify-between h-full">
        <div className="space-y-20">
          <div className="flex space-x-20">
            <Button
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Full}
              onClick={handleDepositClick}
            >
              Deposit {holding.pool.apr7d.total.toFixed(2)}%
            </Button>
            <Button
              variant={ButtonVariant.Secondary}
              onClick={handleWithdrawClick}
              size={ButtonSize.Full}
            >
              Withdraw
            </Button>
          </div>
          <button
            onClick={handleBonusClick}
            className="flex justify-between w-full"
            disabled={!(bonusUsdTotal > 0)}
          >
            <span>Bonus gain</span>
            <span className="text-secondary flex items-center">
              {prettifyNumber(
                shrinkToken(
                  latestProgram?.pendingRewardsWei || 0,
                  latestProgram?.rewardsToken.decimals || 0
                )
              )}{' '}
              {latestProgram?.rewardsToken.symbol}
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
