import { Popover, Switch } from '@headlessui/react';
import { DropdownTransition } from 'components/transitions/DropdownTransition';
import { ReactComponent as IconCheck } from 'assets/icons/check.svg';
import { useState } from 'react';

const options = ['Relavence', 'Highest earning', 'Most popular'];
export const PoolsTableSort = () => {
  const [rewards, setRewards] = useState(false);
  const [option, setOption] = useState(0);

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
            {options.map((x, index) => {
              return (
                <button
                  key={x}
                  className="w-full flex justify-between items-center"
                  onClick={() => setOption(index)}
                >
                  {x}
                  {index === option && <IconCheck className="h-16 w-16" />}
                </button>
              );
            })}
            <hr className="border-fog" />
            <div className="text-12 text-black-low dark:text-white-low">
              Visibility
            </div>
            <div className="flex items-center justify-between">
              Rewards only
              <Switch checked={rewards} onChange={() => setRewards(!rewards)}>
                <span>Toggle USD Switch</span>
              </Switch>
            </div>
          </div>
        </Popover.Panel>
      </DropdownTransition>
    </Popover>
  );
};
