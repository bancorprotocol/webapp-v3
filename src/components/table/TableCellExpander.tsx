import { CellProps } from 'react-table';
import { ReactComponent as IconChevronDown } from 'assets/icons/chevronDown.svg';
import { ReactComponent as IconMore } from 'assets/icons/more.svg';
import { PropsWithChildren } from 'react';
import { classNameGenerator } from 'utils/pureFunctions';
import { Popover } from '@headlessui/react';
import { DropdownTransition } from 'components/transitions/DropdownTransition';

interface Props {
  singleContent: JSX.Element;
  groupContent: JSX.Element;
  cellData: PropsWithChildren<CellProps<any>>;
  canExpandMultiple?: boolean;
  subMenu?: Function;
}

const Expander = (isExpanded: boolean) => (
  <IconChevronDown
    className={`mx-auto w-14 ${classNameGenerator({
      'rotate-180': isExpanded,
    })}`}
  />
);

export const TableCellExpander = ({
  cellData,
  canExpandMultiple = false,
  singleContent,
  groupContent,
  subMenu,
}: Props) => {
  const {
    row: { canExpand, isExpanded, toggleRowExpanded, original },
    toggleAllRowsExpanded,
  } = cellData;

  const handleClick = () => {
    if (!canExpandMultiple && !isExpanded) toggleAllRowsExpanded(false);

    toggleRowExpanded(!isExpanded);
  };

  return (
    <div className="flex items-center">
      {canExpand ? groupContent : original.groupId && singleContent}
      <div className="flex items-center ml-auto gap-5">
        {canExpand && (
          <button
            className="w-[35px] h-[35px] border border-primary rounded-[12px]"
            onClick={() => handleClick()}
          >
            {Expander(isExpanded)}
          </button>
        )}
        {subMenu && (
          <Popover className="block relative">
            <Popover.Button disabled>
              <IconMore className="rotate-90 w-16" />
            </Popover.Button>
            <DropdownTransition>
              <Popover.Panel
                className="p-10 text-center w-[105px] h-[44px] dropdown-menu"
                static
              >
                <button onClick={() => subMenu()}>Withdraw</button>
              </Popover.Panel>
            </DropdownTransition>
          </Popover>
        )}
      </div>
    </div>
  );
};
