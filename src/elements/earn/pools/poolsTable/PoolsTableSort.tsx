import { Popover } from '@headlessui/react';
import { DropdownTransition } from 'components/transitions/DropdownTransition';
import { ReactComponent as IconCheck } from 'assets/icons/check.svg';
import { ReactComponent as IconChevronDown } from 'assets/icons/chevronDown.svg';
import { ReactComponent as IconRibbon } from 'assets/icons/ribbon.svg';
import { ReactComponent as IconPercentage } from 'assets/icons/percentage.svg';
import { ReactComponent as IconEmptyStar } from 'assets/icons/emptyStar.svg';
import { useState } from 'react';
import { Switch } from 'components/switch/Switch';

const options = [
  { icon: <IconRibbon className="w-12" />, text: 'Relavence', default: true },
  { icon: <IconPercentage className="w-16" />, text: 'Highest earning' },
  { icon: <IconEmptyStar className="w-16 h-16" />, text: 'Most popular' },
];

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
        <IconChevronDown className="w-12 ml-10" />
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
                  key={x.text}
                  className="w-full flex justify-between items-center"
                  onClick={() => setOption(index)}
                >
                  <div className="flex items-center gap-5">
                    {x.icon}
                    {x.text}
                    {x.default && (
                      <div className="text-charcoal dark:text-white opacity-50">
                        (Default)
                      </div>
                    )}
                  </div>
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
