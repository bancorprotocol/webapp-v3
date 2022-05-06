import { RouteObject } from 'react-router-dom';
import { Swap } from 'pages/Swap';
import { BancorRoutes } from 'router/routes.service';

export interface PageTradeQuery {
  from?: string | null;
  to?: string | null;
  limit?: boolean | null;
}

export const useRoutesTrade = (): RouteObject[] => {
  return [
    {
      path: BancorRoutes.trade(),
      element: <Swap />,
    },
  ];
};
