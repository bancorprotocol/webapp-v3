import { RouteObject, useRoutes } from 'react-router-dom';
import { useRoutesTrade } from 'router/trade.routes';
import { useRoutesPortfolio } from 'router/portfolio.routes';
import { useRoutesMain } from 'router/main.routes';

export const BancorRouter = () => {
  const routes: RouteObject[] = [
    ...useRoutesTrade(),
    ...useRoutesPortfolio(),
    ...useRoutesMain(),
  ];

  const element = useRoutes(routes);
  return <>{element}</>;
};
