import { RouteObject, useRoutes } from 'react-router-dom';
import { useRoutesTrade } from 'router/trade.routes';
import { useRoutesPortfolio } from 'router/portfolio.routes';
import { useRoutesMain } from 'router/main.routes';
import { useRoutesEarn } from 'router/earn.routes';
import { useRoutesRedirect } from 'router/redirects.routes';

export const BancorRouter = () => {
  const routes: RouteObject[] = [
    ...useRoutesTrade(),
    ...useRoutesEarn(),
    ...useRoutesPortfolio(),
    ...useRoutesMain(),
    ...useRoutesRedirect(),
    // redirectToWelcome
    // welcome
  ];

  const element = useRoutes(routes);
  return <>{element}</>;
};
