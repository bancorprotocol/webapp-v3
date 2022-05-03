import { EarningTableMenuState } from 'elements/earn/portfolio/v3/earningsTable/menu/V3EarningTableMenu';
import { V3EarningsTableSubMenuWrapper } from 'elements/earn/portfolio/v3/earningsTable/menu/V3EarningTableSubMenuWrapper';
import { ReactComponent as IconChevronRight } from 'assets/icons/chevronRight.svg';
import { Holding } from 'store/portfolio/v3Portfolio.types';
import { shrinkToken } from 'utils/formulas';
import { prettifyNumber } from 'utils/helperFunctions';
import { Button, ButtonVariant } from 'components/button/Button';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { updatePortfolioData } from 'services/web3/v3/portfolio/helpers';
import { useDispatch } from 'react-redux';
import { useAppSelector } from 'store';

interface Props {
  holding: Holding;
  setCurrentMenu: (menu: EarningTableMenuState) => void;
  handleApprove: Function;
}

export const V3EarningTableMenuRate = ({
  setCurrentMenu,
  holding,
  handleApprove,
}: Props) => {
  const { standardStakingReward } = holding;
  const dispatch = useDispatch();
  const account = useAppSelector((state) => state.user.account);

  const handleLeaveClick = async () => {
    if (!standardStakingReward || !account) {
      console.error('handleLeaveClick because arguments are not defined');
      return;
    }

    try {
      const tx = await ContractsApi.StandardRewards.write.leave(
        standardStakingReward.id,
        standardStakingReward.poolTokenAmountWei
      );
      await tx.wait();
      await updatePortfolioData(dispatch, account);
    } catch (e) {
      console.error('handleJoinClick', e);
    }
  };

  return (
    <>
      <V3EarningsTableSubMenuWrapper setCurrentMenu={setCurrentMenu}>
        {/*<div className="text-secondary">Annual earn rate</div>*/}
        {/*<div className="text-[28px] my-16">??%</div>*/}

        {/*<ProgressBar percentage={55} showPercentage />*/}
        <Button
          variant={ButtonVariant.PRIMARY}
          onClick={() => handleApprove()}
          className="rounded flex-col w-full my-10 text-left items-start"
        >
          <div className="py-4">
            <div>Stake & Earn Bonus</div>

            <div className="text-20">
              {prettifyNumber(holding.tokenBalance)}{' '}
              {holding.pool.reserveToken.symbol}
            </div>
          </div>

          <div className="text-12 flex mt-10 opacity-70">
            <span>Join the bonus program</span>
            <IconChevronRight className="w-16 ml-5" />
          </div>
        </Button>
        {holding.standardStakingReward && (
          <Button
            variant={ButtonVariant.SECONDARY}
            onClick={handleLeaveClick}
            className="rounded flex-col w-full mb-10 py-8 text-left items-start"
          >
            <div className="text-error">Unstake</div>
            <div className="text-20 text-error">
              {prettifyNumber(
                shrinkToken(
                  holding.standardStakingReward?.tokenAmountWei,
                  holding.pool.decimals
                )
              )}{' '}
              {holding.pool.reserveToken.symbol}
            </div>

            <div className="text-12 flex mt-10 text-secondary">
              <span>Leave the bonus program</span>
              <IconChevronRight className="w-16 ml-5" />
            </div>
          </Button>
        )}
      </V3EarningsTableSubMenuWrapper>
    </>
  );
};
