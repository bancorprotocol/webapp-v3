import { Switch as HUISwitch } from '@headlessui/react';

export const Switch = ({
  selected,
  onChange,
}: {
  selected: boolean;
  onChange: (checked: boolean) => void;
}) => {
  return (
    <HUISwitch
      checked={selected}
      onChange={onChange}
      className={`${
        selected ? 'bg-primary border-primary' : 'bg-graphite border-graphite'
      } relative inline-flex flex-shrink-0 h-[20px] w-[40px] border-2 rounded-full cursor-pointer transition-colors ease-in-out duration-300`}
    >
      <span
        aria-hidden="true"
        className={`${
          selected ? 'translate-x-[20px]' : 'translate-x-0'
        } pointer-events-none inline-block h-[16px] w-[16px] rounded-full bg-white transform transition ease-in-out duration-300`}
      />
    </HUISwitch>
  );
};
