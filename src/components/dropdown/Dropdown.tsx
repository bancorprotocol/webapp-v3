import { Listbox, Transition } from '@headlessui/react';
import { ReactComponent as IconCheck } from 'assets/icons/check.svg';
import { ReactComponent as IconChevronDown } from 'assets/icons/chevronDown.svg';

import 'components/dropdown/Dropdown.css';

interface DropdownProps {
  title: string;
  items: { id: string; title: string; disabled?: boolean }[];
  selected: any;
  setSelected: Function;
}

export const Dropdown = ({
  title,
  items,
  selected,
  setSelected,
}: DropdownProps) => {
  return (
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
        <div className="px-10 py-10 h-80">
          <Listbox.Options className="menu-options">
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
                      className={`
                    ${item.disabled && 'opacity-75'}
                    block truncate pl-2
                    `}
                    >
                      {item.title}
                    </span>
                  </div>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Transition>
    </Listbox>
  );
};
