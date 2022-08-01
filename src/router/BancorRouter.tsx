import { RouteObject, useRoutes, useLocation } from 'react-router-dom';
import { useRoutesTrade } from 'router/useRoutesTrade';
import { useRoutesPortfolio } from 'router/useRoutesPortfolio';
import { useRoutesMain } from 'router/useRoutesMain';
import { useRoutesEarn } from 'router/useRoutesEarn';
import { useRoutesRedirect } from 'router/useRoutesRedirect';
import { subscribeToObservables } from 'services/observables/triggers';
import { useDispatch } from 'react-redux';
import { useEffect, useRef } from 'react';
import { useAppSelector } from 'store';
import { getDarkMode } from 'store/user/user';
import { sendGTMPath } from 'services/api/googleTagManager';

export const BancorRouter = () => {
  const path = useLocation().pathname;
  const currentRoute = useRef<string>();
  const darkMode = useAppSelector<boolean>(getDarkMode);
  const dispatch = useDispatch();

  useEffect(() => {
    if (currentRoute.current !== path)
      sendGTMPath(currentRoute.current, path, darkMode);
    currentRoute.current = path;

    if (path !== '/earn') {
      subscribeToObservables(dispatch);
    }
  }, [path, darkMode, dispatch]);

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
