import { CellProps } from 'react-table';
import { ReactComponent as IconChevronDown } from 'assets/icons/chevronDown.svg';
import { PropsWithChildren } from 'react';

interface Props {
  isExpandedContent?: () => JSX.Element;
  isCollapsedContent?: () => JSX.Element;
  cannotExpandContent?: () => JSX.Element;
  cellData: PropsWithChildren<CellProps<any>>;
  canExpandMultiple?: boolean;
}
export const TableCellExpander = ({
  cellData,
  canExpandMultiple = false,
  isExpandedContent,
  isCollapsedContent,
  cannotExpandContent,
}: Props) => {
  const {
    row: { canExpand, isExpanded, toggleRowExpanded },
    toggleAllRowsExpanded,
  } = cellData;

  const handleClick = () => {
    if (!canExpandMultiple && !isExpanded) {
      toggleAllRowsExpanded(false);
    }
    toggleRowExpanded(!isExpanded);
  };

  return canExpand ? (
    <span onClick={() => handleClick()}>
      {isExpanded ? (
        isExpandedContent ? (
          isExpandedContent()
        ) : (
          <button className="btn-outline-primary btn-sm rounded-[12px] !w-[35px] !h-[35px] p-0 border shadow-header">
            <IconChevronDown className="w-14 rotate-180" />
          </button>
        )
      ) : isCollapsedContent ? (
        isCollapsedContent()
      ) : (
        <button className="btn-outline-primary btn-sm rounded-[12px] !w-[35px] !h-[35px] p-0 border shadow-header">
          <IconChevronDown className="w-14" />
        </button>
      )}
    </span>
  ) : cannotExpandContent ? (
    cannotExpandContent()
  ) : (
    ''
  );
};
