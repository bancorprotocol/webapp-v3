import { useState } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import 'components/Dropdown.css';

export const Dropdown = ({
  title,
  items,
}: {
  title: string;
  items: { id: string; title: string; disabled?: boolean }[];
}) => {
  const [selected, setSelected] = useState(items[0]);

  return (
    <Listbox value={selected} onChange={setSelected}>
      <Listbox.Button className="menu-button">{title}</Listbox.Button>
      <Transition
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <div className="px-1 py-1 h-20">
          <Listbox.Options className="menu-options">
            {items.map((item) => (
              <Listbox.Option
                key={item.id}
                value={item}
                disabled={item.disabled}
                className={({ active }) => `${active && 'bg-blue-500'} py-1`}
              >
                {({ selected }) => (
                  <div className="flex">
                    {selected && (
                      <span className="pl-2">
                        <FontAwesomeIcon icon={faCheck} />
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
