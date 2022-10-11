import { PopoverV3 } from 'components/popover/PopoverV3';
import { ReactComponent as IconCheck } from 'assets/icons/check.svg';
import { ReactComponent as IconChevronDown } from 'assets/icons/chevronDown.svg';
import { ReactComponent as IconInfo } from 'assets/icons/info.svg';
import { ReactComponent as IconUSD } from 'assets/icons/usd.svg';
import { ReactComponent as IconETH } from 'assets/icons/eth.svg';
import { useDispatch } from 'react-redux';
import { setBaseCurrency, setTokenCurrency } from 'store/user/user';
import { useAppSelector } from 'store';
import { Popover } from '@headlessui/react';
import { DropdownTransition } from 'components/transitions/DropdownTransition';

const displayPref = [
  { id: '1', title: <div>Native Token</div>, tooltip: '????' },
  { id: '2', title: <div>Base Currency</div>, tooltip: '????' },
];

const baseCurrencies = [
  {
    id: '1',
    title: (
      <div className="flex items-center gap-10">
        <IconUSD /> USD
      </div>
    ),
  },
  {
    id: '2',
    title: (
      <div className="flex items-center gap-10">
        <IconETH />
        ETH
      </div>
    ),
  },
];

export const CurrencySelection = () => {
  return (
    <Popover className="relative hidden md:block">
      <Popover.Button className="flex items-center gap-10">
        Currency <IconChevronDown className="w-10" />
      </Popover.Button>
      <DropdownTransition>
        <Popover.Panel className="dropdown-menu w-[300px]">
          <CurrencySelectionContent />
        </Popover.Panel>
      </DropdownTransition>
    </Popover>
  );
};

export const CurrencySelectionContent = () => {
  const dispatch = useDispatch();
  const tokenCurrency = useAppSelector((state) => state.user.tokenCurrency);
  const baseCurrency = useAppSelector((state) => state.user.baseCurrency);

  return (
    <div className="flex flex-col gap-[20px]">
      <div className="text-secondary">Currency display preference</div>
      {displayPref.map((item, index) => (
        <MenuItem
          key={item.id}
          title={item.title}
          tooltip={item.tooltip}
          onClick={() => dispatch(setTokenCurrency(index))}
          checked={index === tokenCurrency}
        />
      ))}
      <div className="text-secondary">Base Currency</div>
      {baseCurrencies.map((item, index) => (
        <MenuItem
          key={item.id}
          title={item.title}
          onClick={() => dispatch(setBaseCurrency(index))}
          checked={index === baseCurrency}
        />
      ))}
    </div>
  );
};

const MenuItem = ({
  title,
  checked,
  tooltip,
  onClick,
}: {
  title: JSX.Element;
  checked: boolean;
  onClick: () => void;
  tooltip?: string;
}) => {
  return (
    <button
      className="flex items-center justify-between"
      onClick={() => onClick()}
    >
      <div className="flex items-center gap-10">
        {title}
        {tooltip && (
          <PopoverV3
            buttonElement={() => (
              <IconInfo className="w-10 h-10 text-black-low dark:text-white-low" />
            )}
          >
            {tooltip}
          </PopoverV3>
        )}
      </div>
      {checked && <IconCheck />}
    </button>
  );
};
