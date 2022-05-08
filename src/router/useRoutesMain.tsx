import { Navigate, RouteObject } from 'react-router-dom';
import { Tokens } from 'pages/Tokens';
import { Fiat } from 'pages/Fiat';
import { Vote } from 'pages/Vote';
import { TermsOfUse } from 'pages/TermsOfUse';
import { PrivacyPolicy } from 'pages/PrivacyPolicy';
import { NotFound } from 'pages/NotFound';
import { BancorURL } from 'router/bancorURL.service';
import { Admin } from 'pages/Admin';

export const useRoutesMain = (): RouteObject[] => {
  return [
    {
      path: BancorURL.index,
      element: <Navigate to={BancorURL.trade()} replace />,
    },
    {
      path: BancorURL.tokens,
      element: <Tokens />,
    },
    {
      path: BancorURL.fiat,
      element: <Fiat />,
    },
    {
      path: BancorURL.vote,
      element: <Vote />,
    },
    {
      path: BancorURL.termsOfUse,
      element: <TermsOfUse />,
    },
    {
      path: BancorURL.privacyPolicy,
      element: <PrivacyPolicy />,
    },
    {
      path: BancorURL.admin,
      element: <Admin />,
    },
    {
      path: '*',
      element: <NotFound />,
    },
  ];
};
