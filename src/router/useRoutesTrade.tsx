import { RouteObject } from 'react-router-dom';
import { Swap } from 'pages/Swap';
import { BancorURL } from 'router/bancorURL.service';
import { Trade } from 'pages/trade/Trade';

export interface PageTradeQuery {
  from?: string | null;
  to?: string | null;
  limit?: boolean | null;
}

export const useRoutesTrade = (): RouteObject[] => {
  return [
    {
      path: BancorURL.trade(),
      element: <Swap />,
    },
    {
      path: BancorURL.tradeBeta(),
      element: <Trade />,
    },
  ];
};
