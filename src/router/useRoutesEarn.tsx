import { RouteObject } from 'react-router-dom';
import { Pools } from 'pages/earn/pools/Pools';
import { AddLiquidity } from 'pages/earn/pools/AddLiquidity';
import { BancorURL } from 'router/bancorURL.service';
import { PoolsTable } from 'elements/earn/pools/poolsTable/PoolsTable';
import { EarnTableV2 } from 'elements/earn/pools/poolsTable/EarnTableV2';
import { useState } from 'react';

export const useRoutesEarn = (): RouteObject[] => {
  const [rewards, setRewards] = useState(false);
  const [lowVolume, setLowVolume] = useState(true);
  const [lowLiquidity, setLowLiquidity] = useState(true);
  const [lowEarnRate, setLowEarnRate] = useState(true);
  return [
    {
      path: BancorURL.earn,
      element: <Pools />,
      children: [
        {
          path: BancorURL.earn,
          element: (
            <PoolsTable
              rewards={rewards}
              setRewards={setRewards}
              lowVolume={lowVolume}
              setLowVolume={setLowVolume}
              lowLiquidity={lowLiquidity}
              setLowLiquidity={setLowLiquidity}
              lowEarnRate={lowEarnRate}
              setLowEarnRate={setLowEarnRate}
            />
          ),
        },
        {
          path: BancorURL.earnV2,
          element: (
            <EarnTableV2
              lowVolume={lowVolume}
              setLowVolume={setLowVolume}
              lowLiquidity={lowLiquidity}
              setLowLiquidity={setLowLiquidity}
              lowEarnRate={lowEarnRate}
              setLowEarnRate={setLowEarnRate}
            />
          ),
        },
      ],
    },
    {
      path: BancorURL.addLiquidityV2(':id'),
      element: <AddLiquidity />,
    },
  ];
};
