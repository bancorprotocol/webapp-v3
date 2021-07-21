import { Listbox, Transition } from '@headlessui/react';
import { ReactComponent as IconCheck } from 'assets/icons/check.svg';
import { ReactComponent as IconChevronDown } from 'assets/icons/chevronDown.svg';

import 'components/dropdown/Dropdown.css';

interface DropdownProps {
  title: string;
  items: { id: string; title: any; disabled?: boolean }[];
  selected: any;
  setSelected: Function;
  openUp?: boolean;
}

export const Dropdown = ({
  title,
  items,
  selected,
  setSelected,
  openUp,
}: DropdownProps) => {
  return (
    <div className="relative">
      <Listbox value={selected} onChange={(val) => setSelected(val)}>
        <Listbox.Button className="menu-button">
          <div>{title}</div> <IconChevronDown className="w-10 ml-10" />
        </Listbox.Button>
        <Transition
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="t ransition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Listbox.Options
            className={`menu-options ${openUp ? 'bottom-[50px]' : ''}`}
          >
            {items.map((item) => (
              <Listbox.Option
                key={item.id}
                value={item}
                disabled={item.disabled}
                className={({ active }) => `${active && 'bg-blue-500'} py-10`}
              >
                {({ selected }) => (
                  <div className="flex">
                    {selected && (
                      <span className="pl-2">
                        <IconCheck />
                      </span>
                    )}
                    <span
                      className={`${
                        item.disabled ? 'opacity-75' : ''
                      } block truncate pl-[20px]`}
                    >
                      {item.title}
                    </span>
                  </div>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </Listbox>
    </div>
  );
};
