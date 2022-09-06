import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from 'store';
import { ModalV3 } from 'components/modal/ModalV3';
import { Holding } from 'store/portfolio/v3Portfolio.types';
import { prettifyNumber, toBigNumber } from 'utils/helperFunctions';
import { shrinkToken } from 'utils/formulas';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import {
  confirmLeaveNotification,
  genericFailedNotification,
  rejectNotification,
} from 'services/notifications/notifications';
import { updatePortfolioData } from 'services/web3/v3/portfolio/helpers';
import { ErrorCode } from 'services/web3/types';
import { ReactComponent as IconClock } from 'assets/icons/time.svg';
import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';

interface Props {
  holding: Holding;
  renderButton: (onClick: () => void) => React.ReactNode;
}

export const V3ManageProgramsModal = ({ holding, renderButton }: Props) => {
  const account = useAppSelector((state) => state.user.account);
  const [isOpen, setIsOpen] = useState(false);
  const [txBusy, setTxBusy] = useState(false);
  const onClose = async () => {
    setIsOpen(false);
  };

  const dispatch = useDispatch();

  const programs = holding.programs.filter((p) =>
    toBigNumber(p.tokenAmountWei).gt(0)
  );

  const programsMerged = programs.map((p) => ({
    ...p,
    ...holding.pool.programs.find((pp) => pp.id === p.id),
  }));

  const programsSorted = programsMerged.sort((a, _) => (a.isActive ? 0 : -1));

  const handleLeaveClick = async (
    id: string,
    poolTokenAmountWei: string,
    tokenAmountWei: string
  ) => {
    if (!account) {
      console.error('handleLeaveClick because arguments are not defined');
      return;
    }
    try {
      setTxBusy(true);
      const tx = await ContractsApi.StandardRewards.write.leave(
        id,
        poolTokenAmountWei
      );
      confirmLeaveNotification(
        dispatch,
        tx.hash,
        shrinkToken(tokenAmountWei, holding.pool.decimals),
        holding.pool.reserveToken.symbol
      );
      onClose();
      setTxBusy(false);
      await tx.wait();
      await updatePortfolioData(dispatch);
    } catch (e: any) {
      console.error('handleLeaveClick', e);
      onClose();
      setTxBusy(false);
      if (e.code === ErrorCode.DeniedTx) {
        rejectNotification(dispatch);
      } else {
        genericFailedNotification(dispatch, 'Leave rewards failed');
      }
    }
  };

  return (
    <>
      {renderButton(() => setIsOpen(true))}
      <ModalV3
        title={'Manage Rewards'}
        setIsOpen={onClose}
        isOpen={isOpen}
        separator
        large
      >
        <div className="px-30 pb-30 pt-10">
          <div className="text-secondary mb-48">
            Earn BNT rewards on your bn{holding.pool.reserveToken.symbol}, there
            are no cooldowns or withdrawal fees for adding or removing bnETH to
            reward progrms
          </div>

          <div className="text-secondary">
            Available bn{holding.pool.reserveToken.symbol}
            <div className="flex items-center justify-between mt-30">
              <div>
                <div className="text-black text-20 dark:text-white">
                  {prettifyNumber(
                    new BigNumber(holding.tokenBalance).times(
                      holding.pool.reserveToken.usdPrice
                    ),
                    true
                  )}
                </div>
                <div>
                  {prettifyNumber(holding.poolTokenBalance)} bn
                  {holding.pool.reserveToken.symbol}
                </div>
              </div>
              {holding.pool.latestProgram?.isActive && (
                <Button
                  size={ButtonSize.Small}
                  variant={ButtonVariant.Tertiary}
                >
                  Join Rewards
                </Button>
              )}
            </div>
          </div>
          {programsSorted.length > 0 && (
            <hr className="my-30 border-silver dark:border-grey" />
          )}
          {programsSorted.length > 0 && (
            <>
              <div className="text-seconday mb-30">
                bn{holding.pool.reserveToken.symbol} in BNT Rewards
              </div>

              <div>
                {programsSorted.map((program) => (
                  <div key={program.id}>
                    <div className="flex items-center justify-between text-secondary">
                      <div>
                        <div className="text-black text-20 dark:text-white">
                          {prettifyNumber(
                            new BigNumber(
                              shrinkToken(
                                program.tokenAmountWei,
                                holding.pool.decimals
                              )
                            ).times(holding.pool.reserveToken.usdPrice),
                            true
                          )}
                        </div>
                        <div>
                          {prettifyNumber(
                            shrinkToken(
                              program.poolTokenAmountWei,
                              holding.pool.decimals
                            )
                          )}{' '}
                          bn{holding.pool.reserveToken.symbol}
                        </div>
                      </div>
                      {program.isActive ? (
                        <div className="text-secondary">
                          <div className="text-primary">
                            {holding.pool.apr7d.standardRewards.toFixed(2)}% APR
                          </div>
                          <div className="flex items-center gap-5">
                            <IconClock />
                            {dayjs(program.startTime).format(
                              'MMM D, YYYY'
                            )} - {dayjs(program.endTime).format('MMM D, YYYY')}
                          </div>
                        </div>
                      ) : (
                        <div className="text-error">
                          <div className="text-secondary text-16">Inactive</div>
                          <div className="flex items-center gap-5">
                            <IconClock />
                            Ended {dayjs(program.endTime).format('MMM D, YYYY')}
                          </div>
                        </div>
                      )}
                      <Button
                        variant={ButtonVariant.Tertiary}
                        size={ButtonSize.ExtraSmall}
                        disabled={txBusy}
                        onClick={() =>
                          handleLeaveClick(
                            program.id,
                            program.poolTokenAmountWei,
                            program.tokenAmountWei
                          )
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </ModalV3>
    </>
  );
};
