import { Navigate, RouteObject } from 'react-router-dom';
import { Pools } from 'pages/earn/pools/Pools';
import { Tokens } from 'pages/Tokens';
import { AddLiquidity } from 'pages/earn/pools/AddLiquidity';
import { Fiat } from 'pages/Fiat';
import { Vote } from 'pages/Vote';
import { TermsOfUse } from 'pages/TermsOfUse';
import { PrivacyPolicy } from 'pages/PrivacyPolicy';
import { NotFound } from 'pages/NotFound';
import { BancorRoutes } from 'services/router/routes.service';

export const useRoutesMain = (): RouteObject[] => {
  return [
    {
      path: BancorRoutes.index,
      element: <Navigate to={BancorRoutes.trade()} replace />,
    },
    {
      path: BancorRoutes.earn,
      element: <Pools />,
    },
    {
      path: BancorRoutes.tokens,
      element: <Tokens />,
    },
    {
      path: BancorRoutes.addLiquidityV2(':id'),
      element: <AddLiquidity />,
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
