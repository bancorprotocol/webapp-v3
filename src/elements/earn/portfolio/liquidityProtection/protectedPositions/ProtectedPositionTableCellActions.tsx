import { ProtectedPositionGrouped } from 'services/web3/protection/positions';
import { Row } from 'react-table';
import { ReactComponent as IconChevronDown } from 'assets/icons/chevronDown.svg';
import { ReactComponent as IconWithdraw } from 'assets/icons/withdraw.svg';

export const ProtectedPositionTableCellActions = (
  row: Row<ProtectedPositionGrouped>
) => {
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
    <button className="btn-outline-primary btn-sm rounded-[12px] !w-[35px] !h-[35px] p-0 border shadow-header">
      <IconWithdraw className="w-14" />
    </button>
  );
};
