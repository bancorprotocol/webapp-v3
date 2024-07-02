import { CellProps } from 'react-table';
import { ReactComponent as IconChevronDown } from 'assets/icons/chevronDown.svg';
import { ReactComponent as IconMore } from 'assets/icons/more.svg';
import { PropsWithChildren } from 'react';
import { classNameGenerator } from 'utils/pureFunctions';
import { PopoverV3 } from 'components/popover/PopoverV3';

interface Props {
  singleContent: JSX.Element;
  groupContent?: JSX.Element;
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
    row: { canExpand, isExpanded, toggleRowExpanded },
    toggleAllRowsExpanded,
  } = cellData;

  const handleClick = () => {
    if (!canExpandMultiple && !isExpanded) toggleAllRowsExpanded(false);

    toggleRowExpanded(!isExpanded);
  };

  return (
    <div className="flex items-center justify-end w-full">
      {canExpand ? groupContent : singleContent}
      <div>
        {canExpand && (
          <button
            className="w-[35px] h-[35px] border rounded-[12px]"
            onClick={() => handleClick()}
          >
            {Expander(isExpanded)}
          </button>
        )}
        {subMenu && !canExpand && (
          <PopoverV3
            hover={false}
            showArrow={false}
            buttonElement={({ isOpen, setIsOpen }) => (
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-32 h-32 bg-white dark:bg-black flex items-center justify-center rounded-full"
              >
                <IconMore className="rotate-90 w-16 h-16" />
              </button>
            )}
            options={{
              placement: 'bottom',
              modifiers: [
                {
                  name: 'offset',
                  options: {
                    offset: [0, 10],
                  },
                },
              ],
            }}
          >
            <button onClick={() => subMenu()} className="hover:text-primary">
              Withdraw
            </button>
          </PopoverV3>
        )}
      </div>
    </div>
  );
};
