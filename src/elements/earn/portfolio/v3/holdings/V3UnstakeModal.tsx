import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from 'store';
import { ModalV3 } from 'components/modal/ModalV3';
import { Holding } from 'store/portfolio/v3Portfolio.types';
import { prettifyNumber, toBigNumber } from 'utils/helperFunctions';
import { shrinkToken } from 'utils/formulas';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { ReactComponent as IconGift } from 'assets/icons/gift.svg';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { confirmLeaveNotification } from 'services/notifications/notifications';
import { updatePortfolioData } from 'services/web3/v3/portfolio/helpers';

interface Props {
  holding: Holding;
  renderButton: (onClick: () => void) => React.ReactNode;
}

export const V3UnstakeModal = ({ holding, renderButton }: Props) => {
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

  const activePrograms = programsMerged.filter((p) => p.isActive);
  const inactivePrograms = programsMerged.filter((p) => !p.isActive);

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
    } catch (e) {
      console.error('handleLeaveClick', e);
      onClose();
      setTxBusy(false);
    }
  };

  return (
    <>
      {renderButton(() => setIsOpen(true))}
      <ModalV3
        title={'Bonus Program'}
        setIsOpen={onClose}
        isOpen={isOpen}
        separator
        large
      >
        <div className="p-30 space-y-30">
          <div>
            <IconGift className="text-primary w-40 mx-auto" />
          </div>
          <h2 className="text-center">Reward program you have joined</h2>
          {activePrograms.map((program) => (
            <div
              key={program.id}
              className="flex items-end justify-between bg-secondary rounded px-20 py-10"
            >
              <div>
                <div className="text-20">
                  {prettifyNumber(
                    shrinkToken(program.tokenAmountWei, holding.pool.decimals)
                  )}{' '}
                  {holding.pool.reserveToken.symbol}
                </div>
                <div>Program ID: {program.id}</div>
                <div>APR: {holding.pool.apr.standardRewards.toFixed(2)}%</div>
              </div>
              <div>
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
                  Leave
                </Button>
              </div>
            </div>
          ))}
          {inactivePrograms.length > 0 && (
            <div>
              <div className="text-warning text-center">
                You have joined an inactive program!
              </div>
              <div className="text-secondary text-center mb-10">
                First leave, then join an active program to earn more bonuses.
              </div>
              {inactivePrograms.map((program) => (
                <div
                  key={program.id}
                  className="flex items-end justify-between bg-secondary rounded pl-20 p-10"
                >
                  <div>
                    <div className="text-20">
                      {prettifyNumber(
                        shrinkToken(
                          program.tokenAmountWei,
                          holding.pool.decimals
                        )
                      )}{' '}
                      {holding.pool.reserveToken.symbol}
                    </div>
                    <div>Program ID: {program.id}</div>
                    <div>APR: 0%</div>
                  </div>

                  <div>
                    <Button
                      variant={ButtonVariant.Warning}
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
                      Leave
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ModalV3>
    </>
  );
};
