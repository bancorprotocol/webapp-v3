import { sendGTM } from 'services/api/googleTagManager';

export enum PoolEvent {
  VersionSwitch,
  PoolsFilterOpen,
  PoolsFilter,
  PoolSearch,
  PoolClick,
}

enum PoolLocation {
  MainTable,
  TopPerforming,
}

const poolEventTxtMap = new Map([
  [PoolEvent.VersionSwitch, 'Deposit Pools Version Switch'],
  [PoolEvent.PoolsFilterOpen, 'Deposit Pools Filter Open'],
  [PoolEvent.PoolsFilter, 'Deposit Pools Filter Change'],
  [PoolEvent.PoolSearch, 'Deposit Pools Search'],
]);

export const poolClickLocationTxtMap = new Map([
  [PoolLocation.MainTable, 'Main Table'],
  [PoolLocation.TopPerforming, 'Top Performing'],
]);

interface PoolFilterEP {
  pools_filter_reward_only: string;
  pools_filter_low_volume: string;
  pools_filter_low_popularity: string;
  pools_filter_low_earn_rate: string;
}

export const sendPoolEvent = (
  event: PoolEvent,
  event_properties?:
    | PoolFilterEP
    | { bancor_version_selection: string }
    | { search_term: string }
) => {
  const data = {
    event: poolEventTxtMap.get(event),
    event_properties,
    ga_event: {
      category: 'Deposit',
    },
  };
  sendGTM(data);
};
