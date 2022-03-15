import { Popover } from '@headlessui/react';
import { DropdownTransition } from 'components/transitions/DropdownTransition';
import { ReactComponent as IconCheck } from 'assets/icons/check.svg';
import { useState } from 'react';
import { Switch } from 'components/switch/Switch';

const options = ['Relavence', 'Highest earning', 'Most popular'];
export const PoolsTableSort = () => {
  const [rewards, setRewards] = useState(false);
  const [lowVolume, setLowVolume] = useState(false);
  const [lowPopularity, setLowPopularity] = useState(false);
  const [lowEarnRate, setLowEarnRate] = useState(false);
  const [bootstrap, setBootstrap] = useState(false);
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
            <div className="space-y-24">
              <div className="flex items-center justify-between">
                Rewards only
                <Switch
                  selected={rewards}
                  onChange={() => setRewards(!rewards)}
                />
              </div>
              <div className="flex items-center justify-between">
                Show Low Volume
                <Switch
                  selected={lowVolume}
                  onChange={() => setLowVolume(!lowVolume)}
                />
              </div>
              <div className="flex items-center justify-between">
                Show Low Popularity
                <Switch
                  selected={lowPopularity}
                  onChange={() => setLowPopularity(!lowPopularity)}
                />
              </div>
              <div className="flex items-center justify-between">
                Low Earn Rate
                <Switch
                  selected={lowEarnRate}
                  onChange={() => setLowEarnRate(!lowEarnRate)}
                />
              </div>
              <div className="flex items-center justify-between">
                Bootstrap Only
                <Switch
                  selected={bootstrap}
                  onChange={() => setBootstrap(!bootstrap)}
                />
              </div>
            </div>
          </div>
        </Popover.Panel>
      </DropdownTransition>
    </Popover>
  );
};
