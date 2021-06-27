import { ReactComponent as IconChevron } from 'assets/icons/chevronRight.svg';
import { Popover } from '@headlessui/react';
import { SecondaryMenuItem } from 'elements/sidebar/menuSecondary/MenuSecondary';

export const MenuSecondaryItem = ({
  label,
  icon,
}: SecondaryMenuItem) => {
  return (
    <Popover.Button className="w-full flex items-center justify-between overflow-hidden">
      <span className="flex items-center">
        <span className="ml-2 mr-20">{icon}</span>
        {label}
      </span>
      <span>
        <IconChevron className="w-16" />
      </span>
    </Popover.Button>
  );
};
