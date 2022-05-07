import { RouteObject } from 'react-router-dom';
import { Pools } from 'pages/earn/pools/Pools';
import { AddLiquidity } from 'pages/earn/pools/AddLiquidity';
import { BancorURL } from 'router/bancorURL.service';
import { PoolsTable } from 'elements/earn/pools/poolsTable/PoolsTable';
import { EarnTableV2 } from 'elements/earn/pools/poolsTable/EarnTableV2';

export const useRoutesEarn = (): RouteObject[] => {
  return [
    {
      path: BancorURL.earn,
      element: <Pools />,
      children: [
        {
          path: BancorURL.earn,
          element: <PoolsTable />,
        },
        {
          path: BancorURL.earnV2,
          element: <EarnTableV2 />,
        },
      ],
    },
    {
      path: BancorURL.addLiquidityV2(':id'),
      element: <AddLiquidity />,
    },
  ];
};
