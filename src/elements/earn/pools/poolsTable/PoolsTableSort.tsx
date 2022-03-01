import { Popover, Switch } from '@headlessui/react';
import { DropdownTransition } from 'components/transitions/DropdownTransition';
import { useState } from 'react';

export const PoolsTableSort = () => {
  const [rewards, setRewards] = useState(false);
  return (
    <Popover className="hidden md:block relative">
      <Popover.Button className="flex items-center">
        Sort and Filter
      </Popover.Button>
      <DropdownTransition>
        <Popover.Panel className="dropdown-menu w-[240px]">
          <div className="space-y-15">
            <div className="text-12 text-black-low dark:text-white-low">
              Sort By
            </div>
            <div>Relavence</div>
            <div>Highest earning</div>
            <div>Most popular</div>
            <hr className="border-fog" />
            <div className="text-12 text-black-low dark:text-white-low">
              Visibility
            </div>
            <div className="flex items-center justify-between">
              Rewards only
              <Switch
                checked={rewards}
                onChange={() => setRewards(!rewards)}
                className={'swap-switch'}
              >
                <span className="sr-only">Toggle USD Switch</span>
                <span aria-hidden="true" className={'swap-switch-toggle'} />
              </Switch>
            </div>
          </div>
        </Popover.Panel>
      </DropdownTransition>
    </Popover>
  );
};
