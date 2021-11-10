import { ProtectedPositionGrouped } from 'services/web3/protection/positions';
import { Row } from 'react-table';
import { ReactComponent as IconChevronDown } from 'assets/icons/chevronDown.svg';
import { ReactComponent as IconWithdraw } from 'assets/icons/withdraw.svg';
import { useState } from 'react';
import { WithdrawLiquidityWidget } from 'elements/earn/portfolio/withdrawLiquidity/WithdrawLiquidityWidget';

export const ProtectedPositionTableCellActions = (
  row: Row<ProtectedPositionGrouped>
) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return row.canExpand ? (
    <span {...row.getToggleRowExpandedProps()}>
      {row.isExpanded ? (
        <button className="btn-outline-primary btn-sm rounded-[12px] !w-[35px] !h-[35px] p-0 border shadow-header">
          <IconChevronDown className="w-14 rotate-180" />
        </button>
      ) : (
        <button className="btn-outline-primary btn-sm rounded-[12px] !w-[35px] !h-[35px] p-0 border shadow-header">
          <IconChevronDown className="w-14" />
        </button>
      )}
    </span>
  ) : (
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
};
