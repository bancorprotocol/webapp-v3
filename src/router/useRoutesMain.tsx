import { Navigate, RouteObject } from 'react-router-dom';
import { Fiat } from 'pages/Fiat';
import { Vote } from 'pages/vote/Vote';
import { TermsOfUse } from 'pages/TermsOfUse';
import { PrivacyPolicy } from 'pages/PrivacyPolicy';
import { NotFound } from 'pages/NotFound';
import { BancorURL } from 'router/bancorURL.service';
import { Admin } from 'pages/Admin';
import { isProduction } from 'utils/constants';

const debugMode: RouteObject[] = !isProduction
  ? [
      {
        path: BancorURL.admin,
        element: <Admin />,
      },
    ]
  : [];

export const useRoutesMain = (): RouteObject[] => {
  return [
    {
      path: BancorURL.index,
      element: <Navigate to={BancorURL.earn} replace />,
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
    ...debugMode,
    {
      path: '*',
      element: <NotFound />,
    },
  ];
};
