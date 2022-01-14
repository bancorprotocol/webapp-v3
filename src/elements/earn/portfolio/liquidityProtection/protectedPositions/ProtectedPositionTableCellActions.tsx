import {
  ProtectedPosition,
  ProtectedPositionGrouped,
} from 'services/web3/protection/positions';
import { CellProps } from 'react-table';
import { ReactComponent as IconWithdraw } from 'assets/icons/withdraw.svg';
import { PropsWithChildren, useCallback, useMemo, useState } from 'react';
import { WithdrawLiquidityWidget } from 'elements/earn/portfolio/withdrawLiquidity/WithdrawLiquidityWidget';
import { TableCellExpander } from 'components/table/TableCellExpander';
import { StakeRewardsBtn } from '../rewards/StakeRewardsBtn';
import BigNumber from 'bignumber.js';
import { ButtonIcon } from '../../../../../components/button/ButtonIcon';

export const ProtectedPositionTableCellActions = (
  cellData: PropsWithChildren<
    CellProps<ProtectedPositionGrouped, ProtectedPosition[]>
  >
) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { row } = cellData;
  const position = row.original;
  const canStakeRewards = useMemo(
    () => new BigNumber(position.rewardsAmount).gt(0) && position.groupId,
    [position.groupId, position.rewardsAmount]
  );

  const getCannotExpandContent = useCallback(
    () => (
      <>
        <WithdrawLiquidityWidget
          protectedPosition={position}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
        />
        <ButtonIcon
          onClick={() => setIsModalOpen(true)}
          secondary
          className="shadow-header"
        >
          <IconWithdraw className="w-14" />
        </ButtonIcon>
      </>
    ),
    [isModalOpen, position]
  );

  return (
    <div className="flex justify-end">
      {canStakeRewards && (
        <StakeRewardsBtn
          buttonLabel="Stake Rewards"
          buttonClass="btn btn-primary btn-sm !h-[35px] mr-10"
          posGroupId={position.groupId}
        />
      )}
      {TableCellExpander({
        cellData,
        getCannotExpandContent,
      })}
    </div>
  );
};
