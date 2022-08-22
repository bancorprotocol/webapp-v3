import { Switch as HUISwitch } from '@headlessui/react';

export enum SwitchVariant {
  PRIMARY,
  ERROR,
}

const getVariantClasses = (variant: SwitchVariant) => {
  switch (variant) {
    case SwitchVariant.PRIMARY:
      return 'bg-primary border-primary';
    case SwitchVariant.ERROR:
      return 'bg-error border-error';
    default:
      return 'bg-primary border-primary';
  }
};

export const Switch = ({
  variant = SwitchVariant.PRIMARY,
  selected,
  onChange,
}: {
  variant?: SwitchVariant;
  selected: boolean;
  onChange: (checked: boolean) => void;
}) => {
  return (
    <HUISwitch
      checked={selected}
      onChange={onChange}
      className={`${
        selected
          ? getVariantClasses(variant)
          : 'bg-graphite border-graphite dark:bg-grey dark:border-grey'
      } relative inline-flex flex-shrink-0 h-[20px] w-[40px] border-2 rounded-full cursor-pointer transition-colors ease-in-out duration-300`}
    >
      <span
        aria-hidden="true"
        className={`${
          selected ? 'translate-x-[20px]' : 'translate-x-0'
        } pointer-events-none inline-block h-[16px] w-[16px] rounded-full bg-white dark:bg-charcoal transform transition ease-in-out duration-300`}
      />
    </HUISwitch>
  );
};
