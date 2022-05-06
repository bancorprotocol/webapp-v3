import { Navigate, RouteObject } from 'react-router-dom';
import { Tokens } from 'pages/Tokens';
import { Fiat } from 'pages/Fiat';
import { Vote } from 'pages/Vote';
import { TermsOfUse } from 'pages/TermsOfUse';
import { PrivacyPolicy } from 'pages/PrivacyPolicy';
import { NotFound } from 'pages/NotFound';
import { BancorRoutes } from 'router/routes.service';

export const useRoutesMain = (): RouteObject[] => {
  return [
    {
      path: BancorRoutes.index,
      element: <Navigate to={BancorRoutes.trade()} replace />,
    },
    {
      path: BancorRoutes.tokens,
      element: <Tokens />,
    },
    {
      path: BancorRoutes.fiat,
      element: <Fiat />,
    },
    {
      path: BancorRoutes.vote,
      element: <Vote />,
    },
    {
      path: BancorRoutes.termsOfUse,
      element: <TermsOfUse />,
    },
    {
      path: BancorRoutes.privacyPolicy,
      element: <PrivacyPolicy />,
    },
    {
      path: '*',
      element: <NotFound />,
    },
  ];
};
