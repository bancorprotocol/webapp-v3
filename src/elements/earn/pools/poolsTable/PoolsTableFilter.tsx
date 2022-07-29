import { Popover } from '@headlessui/react';
import { DropdownTransition } from 'components/transitions/DropdownTransition';
import { ReactComponent as IconChevronDown } from 'assets/icons/chevronDown.svg';
import { Switch } from 'components/switch/Switch';
import { PoolEvent, sendPoolEvent } from 'services/api/googleTagManager/pool';
import { getOnOff } from 'services/api/googleTagManager';
import { useState } from 'react';

export const PoolsTableFilter = ({
  rewards,
  setRewards,
  lowVolume,
  setLowVolume,
  lowLiquidity,
  setLowLiquidity,
  lowEarnRate,
  setLowEarnRate,
}: {
  rewards?: boolean;
  setRewards?: Function;
  lowVolume: boolean;
  setLowVolume: Function;
  lowLiquidity: boolean;
  setLowLiquidity: Function;
  lowEarnRate: boolean;
  setLowEarnRate: Function;
}) => {
  const [filters, setFilters] = useState({
    rewards,
    lowVolume,
    lowLiquidity,
    lowEarnRate,
  });
  const checkChanged = () => {
    if (
      filters.rewards !== rewards ||
      filters.lowVolume !== lowVolume ||
      filters.lowLiquidity !== lowLiquidity ||
      filters.lowEarnRate !== lowEarnRate
    ) {
      sendPoolEvent(PoolEvent.PoolsFilter, {
        pools_filter_reward_only: getOnOff(!!rewards),
        pools_filter_low_volume: getOnOff(!!lowVolume),
        pools_filter_low_popularity: getOnOff(!!lowLiquidity),
        pools_filter_low_earn_rate: getOnOff(!!lowEarnRate),
      });
    }
  };
  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button
            className="flex items-center"
            onClick={() => {
              if (!open) {
                setFilters({ rewards, lowVolume, lowLiquidity, lowEarnRate });
                sendPoolEvent(PoolEvent.PoolsFilterOpen);
              } else checkChanged();
            }}
          >
            Filter
            <IconChevronDown className="w-12 ml-10" />
          </Popover.Button>
          <DropdownTransition>
            <Popover.Panel
              onTransitionEndCapture={() => {
                if (!open) checkChanged();
              }}
              className="dropdown-menu w-[240px]"
            >
              <div className="space-y-15">
                <div className="space-y-24">
                  {setRewards && (
                    <div className="flex items-center justify-between">
                      Rewards only
                      <Switch
                        selected={rewards!}
                        onChange={() => setRewards(!rewards)}
                      />
                    </div>
                  )}
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
        </>
      )}
    </Popover>
  );
};
