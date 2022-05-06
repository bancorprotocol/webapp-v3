import { RouteObject } from 'react-router-dom';
import { Pools } from 'pages/earn/pools/Pools';
import { AddLiquidity } from 'pages/earn/pools/AddLiquidity';
import { BancorRoutes } from 'router/routes.service';
import { PoolsTable } from 'elements/earn/pools/poolsTable/PoolsTable';
import { EarnTableV2 } from 'elements/earn/pools/poolsTable/EarnTableV2';

export const useRoutesEarn = (): RouteObject[] => {
  return [
    {
      path: BancorRoutes.earn,
      element: <Pools />,
      children: [
        {
          path: BancorRoutes.earn,
          element: <PoolsTable />,
        },
        {
          path: BancorRoutes.earnV2,
          element: <EarnTableV2 />,
        },
      ],
    },
    {
      path: BancorRoutes.addLiquidityV2(':id'),
      element: <AddLiquidity />,
    },
  ];
};
