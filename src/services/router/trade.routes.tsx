import { Navigate, RouteObject, useLocation } from 'react-router-dom';
import { Swap } from 'pages/Swap';
import { PageTradeQuery } from 'services/router/index';
import { BancorRoutes } from 'services/router/routes.service';

export const useRoutesTrade = (): RouteObject[] => {
  const searchParams = new URLSearchParams(useLocation().search);

  const tradeSearchParams: PageTradeQuery = {
    from: searchParams.get('from'),
    to: searchParams.get('to'),
    limit: !!searchParams.get('limit'),
  };

  return [
    {
      path: BancorRoutes.trade(),
      element: <Swap />,
    },
    // Legacy routes redirect
    {
      path: '/swap',
      element: <Navigate to={BancorRoutes.trade(tradeSearchParams)} replace />,
    },
    {
      path: '/eth/swap',
      element: <Navigate to={BancorRoutes.trade(tradeSearchParams)} replace />,
    },
  ];
};
