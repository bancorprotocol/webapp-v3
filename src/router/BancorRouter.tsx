import { RouteObject, useRoutes } from 'react-router-dom';
import { useRoutesTrade } from 'router/useRoutesTrade';
import { useRoutesPortfolio } from 'router/useRoutesPortfolio';
import { useRoutesMain } from 'router/useRoutesMain';
import { useRoutesEarn } from 'router/useRoutesEarn';
import { useRoutesRedirect } from 'router/useRoutesRedirect';

export const BancorRouter = () => {
  const routes: RouteObject[] = [
    ...useRoutesTrade(),
    ...useRoutesEarn(),
    ...useRoutesPortfolio(),
    ...useRoutesMain(),
    ...useRoutesRedirect(),
  ];

  const element = useRoutes(routes);
  return <>{element}</>;
};
