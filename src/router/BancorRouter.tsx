import { RouteObject, useLocation, useRoutes } from 'react-router-dom';
import { useRoutesTrade } from 'router/useRoutesTrade';
import { useRoutesPortfolio } from 'router/useRoutesPortfolio';
import { useRoutesMain } from 'router/useRoutesMain';
import { useRoutesEarn } from 'router/useRoutesEarn';
import { useRoutesRedirect } from 'router/useRoutesRedirect';
import { useEffect } from 'react';
import { subscribeToObservables } from 'services/observables/triggers';
import { useDispatch } from 'react-redux';

export const BancorRouter = () => {
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname !== '/earn') {
      subscribeToObservables(dispatch);
    }
  }, [dispatch, pathname]);

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
