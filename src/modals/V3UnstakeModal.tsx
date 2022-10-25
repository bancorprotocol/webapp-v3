import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from 'store';
import { Holding } from 'store/portfolio/v3Portfolio.types';
import { prettifyNumber, toBigNumber } from 'utils/helperFunctions';
import { shrinkToken } from 'utils/formulas';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { ReactComponent as IconGift } from 'assets/icons/gift.svg';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import {
  confirmLeaveNotification,
  genericFailedNotification,
  rejectNotification,
} from 'services/notifications/notifications';
import { updatePortfolioData } from 'services/web3/v3/portfolio/helpers';
import { ErrorCode } from 'services/web3/types';
import { Modal, ModalNames } from 'modals';
import { getIsModalOpen, getModalData } from 'store/modals/modals';
import { useModal } from 'hooks/useModal';

interface V3UnstakeProps {
  holding: Holding;
}

export const V3UnstakeModal = () => {
  const account = useAppSelector((state) => state.user.account);
  const { popModal } = useModal();
  const [txBusy, setTxBusy] = useState(false);
  const dispatch = useDispatch();
  const isOpen = useAppSelector((state) =>
    getIsModalOpen(state, ModalNames.V3Unstake)
  );

  const props = useAppSelector<V3UnstakeProps | undefined>((state) =>
    getModalData(state, ModalNames.V3Unstake)
  );

  const onClose = () => {
    popModal();
  };

  if (!props) return null;

  const { holding } = props;

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
      <Modal
        title={'Rewards'}
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
                <div>APR: {holding.pool.apr7d.standardRewards.toFixed(2)}%</div>
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
                      variant={ButtonVariant.Secondary}
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
      </Modal>
    </>
  );
};
