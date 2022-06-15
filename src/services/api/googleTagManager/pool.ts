import { sendGTM } from 'services/api/googleTagManager';

enum PoolEvent {
  VersionSwitch,
  PoolsOpen,
  PoolsFilter,
  PoolSearch,
  PoolClick,
}

enum PoolLocation {
  MainTable,
  TopPerforming,
}

const poolEventTxtMap = new Map([
  [PoolEvent.VersionSwitch, 'Pools Version Switch'],
  [PoolEvent.PoolsOpen, 'Pools Filter Open'],
  [PoolEvent.PoolsFilter, 'Pools Filter Change'],
  [PoolEvent.PoolSearch, 'Pools Search'],
  [PoolEvent.PoolClick, 'Pool Click'],
]);

export const poolClickLocationTxtMap = new Map([
  [PoolLocation.MainTable, 'Main Table'],
  [PoolLocation.TopPerforming, 'Top Performing'],
]);

interface PoolFilterEP {
  pools_bancor_version_selection: string;
  pools_filter_reward_only: string;
  pools_filter_low_volume: string;
  pools_filter_low_popularity: string;
  pools_filter_low_earn_rate: string;
}

interface PoolClickEP {
  pool: string;
  pool_click_location: 'Main Table' | 'Top Performing';
}

export const sendPoolEvent = (
  event: PoolEvent,
  event_properties:
    | PoolFilterEP
    | PoolClickEP
    | { pools_bancor_version_selection: string }
    | { pools_search_term: string }
) => {
  const data = {
    event: poolEventTxtMap.get(event),
    event_properties,
    ga_event: {
      category: 'Pools Page',
    },
  };
  sendGTM(data);
};
