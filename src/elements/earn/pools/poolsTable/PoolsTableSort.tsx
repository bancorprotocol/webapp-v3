import { Popover } from '@headlessui/react';
import { DropdownTransition } from 'components/transitions/DropdownTransition';
import { ReactComponent as IconChevronDown } from 'assets/icons/chevronDown.svg';
import { Switch } from 'components/switch/Switch';

export const PoolsTableSort = ({
  rewards,
  setRewards,
  lowVolume,
  setLowVolume,
  lowLiquidity,
  setLowLiquidity,
  lowEarnRate,
  setLowEarnRate,
}: {
  rewards: boolean;
  setRewards: Function;
  lowVolume: boolean;
  setLowVolume: Function;
  lowLiquidity: boolean;
  setLowLiquidity: Function;
  lowEarnRate: boolean;
  setLowEarnRate: Function;
}) => {
  return (
    <Popover className="relative">
      <Popover.Button className="flex items-center">
        Filter
        <IconChevronDown className="w-12 ml-10" />
      </Popover.Button>
      <DropdownTransition>
        <Popover.Panel className="dropdown-menu w-[240px]">
          <div className="space-y-15">
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
                Show Low Liquidity
                <Switch
                  selected={lowLiquidity}
                  onChange={() => setLowLiquidity(!lowLiquidity)}
                />
              </div>
              <div className="flex items-center justify-between">
                Low Earn Rate
                <Switch
                  selected={lowEarnRate}
                  onChange={() => setLowEarnRate(!lowEarnRate)}
                />
              </div>
            </div>
          </div>
        </Popover.Panel>
      </DropdownTransition>
    </Popover>
  );
};
