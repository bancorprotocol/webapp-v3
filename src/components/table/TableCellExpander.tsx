import { CellProps } from 'react-table';
import { ReactComponent as IconChevronDown } from 'assets/icons/chevronDown.svg';
import { PropsWithChildren } from 'react';
import { Button, ButtonVariant } from 'components/button/Button';
import { classNameGenerator } from 'utils/pureFunctions';

interface Props {
  singleContent: JSX.Element;
  groupContent: JSX.Element;
  cellData: PropsWithChildren<CellProps<any>>;
  canExpandMultiple?: boolean;
}

const Expander = (isExpanded: boolean) => (
  <IconChevronDown
    className={`w-14 ${classNameGenerator({ 'rotate-180': isExpanded })}`}
  />
);

export const TableCellExpander = ({
  cellData,
  canExpandMultiple = false,
  singleContent,
  groupContent,
}: Props) => {
  const {
    row: { canExpand, isExpanded, toggleRowExpanded },
    toggleAllRowsExpanded,
  } = cellData;

  const handleClick = () => {
    if (!canExpandMultiple && !isExpanded) toggleAllRowsExpanded(false);

    toggleRowExpanded(!isExpanded);
  };

  return canExpand ? (
    <div className="flex items-center justify-between">
      {groupContent}
      <Button onClick={() => handleClick()} variant={ButtonVariant.SECONDARY}>
        {Expander(isExpanded)}
      </Button>
    </div>
  ) : (
    singleContent
  );
};
