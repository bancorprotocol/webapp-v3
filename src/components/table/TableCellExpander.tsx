import { CellProps } from 'react-table';
import { ReactComponent as IconChevronDown } from 'assets/icons/chevronDown.svg';
import { PropsWithChildren } from 'react';

interface Props {
  getExpandedContent?: () => JSX.Element;
  getCollapsedContent?: () => JSX.Element;
  getCannotExpandContent?: () => JSX.Element | string;
  cellData: PropsWithChildren<CellProps<any>>;
  canExpandMultiple?: boolean;
}

const getDefaultExpandedContent = () => (
  <button className="btn-outline-primary btn-sm rounded-[12px] !w-[35px] !h-[35px] p-0 border shadow-header">
    <IconChevronDown className="w-14 rotate-180" />
  </button>
);
const getDefaultCollapsedContent = () => (
  <button className="btn-outline-primary btn-sm rounded-[12px] !w-[35px] !h-[35px] p-0 border shadow-header">
    <IconChevronDown className="w-14" />
  </button>
);
const getDefaultCannotExpandContent = () => '';

export const TableCellExpander = ({
  cellData,
  canExpandMultiple = false,
  getExpandedContent = getDefaultExpandedContent,
  getCollapsedContent = getDefaultCollapsedContent,
  getCannotExpandContent = getDefaultCannotExpandContent,
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
      {isExpanded ? getExpandedContent() : getCollapsedContent()}
    </span>
  ) : (
    getCannotExpandContent()
  );
};
