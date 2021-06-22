import { Popover } from '@headlessui/react';
import { DropdownTransition } from 'components/transitions/DropdownTransition';
import { ReactComponent as IconCog } from 'assets/icons/cog.svg';

export const SettingsMenu = () => {
  return (
    <Popover className="relative">
      <Popover.Button className="flex items-center">
        <IconCog className="w-[20px]" />
      </Popover.Button>

      <DropdownTransition>
        <Popover.Panel className="dropdown-menu">
          <div className="dropdown-bubble" />
          <div className="dropdown-header">Settings</div>

          <div className="space-y-15">
            <div className="flex justify-between">
              <div>Color Mode</div>
              <div>sun | moon</div>
            </div>

            <div className="flex justify-between">
              <div>Languages</div>
              <div>English</div>
            </div>

            <div className="flex justify-between">
              <div>Currency</div>
              <div>USD</div>
            </div>

            <div className="flex justify-between">
              <div>Blockchain</div>
              <div>ETH</div>
            </div>
          </div>

          <hr className="border-grey-3 mt-15 mb-10" />

          <div className="text-12">Version 0.0.1</div>
        </Popover.Panel>
      </DropdownTransition>
    </Popover>
  );
};
