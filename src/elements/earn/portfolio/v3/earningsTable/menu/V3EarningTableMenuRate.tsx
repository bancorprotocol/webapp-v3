import { EarningTableMenuState } from 'elements/earn/portfolio/v3/earningsTable/menu/V3EarningTableMenu';
import { V3EarningsTableSubMenuWrapper } from 'elements/earn/portfolio/v3/earningsTable/menu/V3EarningTableSubMenuWrapper';
import { ReactComponent as IconChevronRight } from 'assets/icons/chevronRight.svg';
import { Holding } from 'store/portfolio/v3Portfolio.types';
import { shrinkToken } from 'utils/formulas';
import { prettifyNumber } from 'utils/helperFunctions';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { updatePortfolioData } from 'services/web3/v3/portfolio/helpers';
import { useDispatch } from 'react-redux';
import { useAppSelector } from 'store';
import { useState } from 'react';
import { confirmLeaveNotification } from 'services/notifications/notifications';

interface Props {
  holding: Holding;
  setCurrentMenu: (menu: EarningTableMenuState) => void;
  onStartJoin: Function;
  txJoinBusy: boolean;
}

export const V3EarningTableMenuRate = ({
  setCurrentMenu,
  holding,
  onStartJoin,
  txJoinBusy,
}: Props) => {
  const { latestProgram } = holding;
  const dispatch = useDispatch();
  const account = useAppSelector((state) => state.user.account);
  const [txLeaveBusy, setTxLeaveBusy] = useState(false);

  const btnLeaveDisabled =
    txJoinBusy ||
    txLeaveBusy ||
    !latestProgram ||
    latestProgram?.tokenAmountWei === '0';

  const btnJoinDisabled =
    txJoinBusy ||
    txLeaveBusy ||
    !Number(holding.tokenBalance || !holding.pool.latestProgram);

  const handleLeaveClick = async () => {
    if (!latestProgram || !account) {
      console.error('handleLeaveClick because arguments are not defined');
      return;
    }
    setTxLeaveBusy(true);
    try {
      const tx = await ContractsApi.StandardRewards.write.leave(
        latestProgram.id,
        latestProgram.poolTokenAmountWei
      );
      confirmLeaveNotification(
        dispatch,
        tx.hash,
        shrinkToken(latestProgram?.tokenAmountWei || 0, holding.pool.decimals),
        holding.pool.reserveToken.symbol
      );
      await tx.wait();
      await updatePortfolioData(dispatch);
      setTxLeaveBusy(false);
    } catch (e) {
      console.error('handleJoinClick', e);
      setTxLeaveBusy(false);
    }
  };

  return (
    <>
      <V3EarningsTableSubMenuWrapper setCurrentMenu={setCurrentMenu}>
        {/*<div className="text-secondary">Annual earn rate</div>*/}
        {/*<div className="text-[28px] my-16">??%</div>*/}

        {/*<ProgressBar percentage={55} showPercentage />*/}
        <Button
          onClick={() => onStartJoin()}
          disabled={btnJoinDisabled}
          size={ButtonSize.Full}
          className="rounded flex-col my-10 text-left items-start"
        >
          <div className="py-4">
            <div>Deposit & Earn Bonus</div>

            <div className="text-20">
              {prettifyNumber(holding.tokenBalance)}{' '}
              {holding.pool.reserveToken.symbol}
            </div>
          </div>

          <div className="text-12 flex mt-10 opacity-70">
            <span>Join the rewards program</span>
            <IconChevronRight className="w-16 ml-5" />
          </div>
        </Button>
        <Button
          variant={ButtonVariant.Secondary}
          onClick={handleLeaveClick}
          disabled={btnLeaveDisabled}
          size={ButtonSize.Full}
          className="rounded flex-col mb-10 py-8 text-left items-start"
        >
          <div
            className={`${btnLeaveDisabled ? 'text-secondary' : 'text-error'}`}
          >
            Unstake
          </div>
          <div
            className={`text-20 ${
              btnLeaveDisabled ? 'text-secondary' : 'text-error'
            }`}
          >
            {prettifyNumber(
              shrinkToken(
                holding.latestProgram?.tokenAmountWei || 0,
                holding.pool.decimals
              )
            )}{' '}
            {holding.pool.reserveToken.symbol}
          </div>

          <div className="text-12 flex mt-10 text-secondary">
            <span>Leave the rewards program</span>
            <IconChevronRight className="w-16 ml-5" />
          </div>
        </Button>
      </V3EarningsTableSubMenuWrapper>
    </>
  );
};
