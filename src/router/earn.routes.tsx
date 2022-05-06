import { RouteObject } from 'react-router-dom';
import { Pools } from 'pages/earn/pools/Pools';
import { AddLiquidity } from 'pages/earn/pools/AddLiquidity';
import { BancorRoutes } from 'router/routes.service';

export const useRoutesEarn = (): RouteObject[] => {
  return [
    {
      path: BancorRoutes.earn,
      element: <Pools />,
    },
    {
      path: BancorRoutes.addLiquidityV2(':id'),
      element: <AddLiquidity />,
    },
  ];
};
