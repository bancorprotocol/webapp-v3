import {
  ProtectedPosition,
  ProtectedPositionGrouped,
} from 'services/web3/protection/positions';
import { CellProps } from 'react-table';
import { ReactComponent as IconWithdraw } from 'assets/icons/withdraw.svg';
import { PropsWithChildren, useState } from 'react';
import { WithdrawLiquidityWidget } from 'elements/earn/portfolio/withdrawLiquidity/WithdrawLiquidityWidget';
import { TableCellExpander } from 'components/table/TableCellExpander';

export const ProtectedPositionTableCellActions = (
  cellData: PropsWithChildren<
    CellProps<ProtectedPositionGrouped, ProtectedPosition[]>
  >
) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { row } = cellData;

  const cannotExpandContent = () => (
    <>
      <WithdrawLiquidityWidget
        protectedPosition={row.original}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
      <button
        onClick={() => setIsModalOpen(true)}
        className="btn-outline-primary btn-sm rounded-[12px] !w-[35px] !h-[35px] p-0 border shadow-header"
      >
        <IconWithdraw className="w-14" />
      </button>
    </>
  );

  return TableCellExpander({
    cellData,
    cannotExpandContent,
  });
};
