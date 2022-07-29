import { RouteObject, useLocation, useRoutes } from 'react-router-dom';
import { useRoutesTrade } from 'router/useRoutesTrade';
import { useRoutesPortfolio } from 'router/useRoutesPortfolio';
import { useRoutesMain } from 'router/useRoutesMain';
import { useRoutesEarn } from 'router/useRoutesEarn';
import { useRoutesRedirect } from 'router/useRoutesRedirect';
import { useEffect, useRef } from 'react';
import { useAppSelector } from 'store';
import { getDarkMode } from 'store/user/user';
import { sendGTMPath } from 'services/api/googleTagManager';

export const BancorRouter = () => {
  const path = useLocation().pathname;
  const currentRoute = useRef<string>();
  const darkMode = useAppSelector<boolean>(getDarkMode);

  useEffect(() => {
    if (currentRoute.current !== path)
      sendGTMPath(currentRoute.current, path, darkMode);
    currentRoute.current = path;
  }, [path, darkMode]);

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
