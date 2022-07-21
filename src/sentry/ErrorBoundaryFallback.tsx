import { JSXElementConstructor, ReactElement } from 'react';
import * as Sentry from '@sentry/react';

type FallbackComponent =
  | ReactElement<any, string | JSXElementConstructor<any>>
  | Sentry.FallbackRender
  | undefined;

export const ErrorBoundaryFallback: FallbackComponent = ({
  error,
  componentStack,
}) => {
  return (
    <div>
      <h1>Internal Error</h1>
      <h2>Name: {error.name && error.name}</h2>
      <h2>Message: {error.message && error.message}</h2>
      <div>Component Stack: {componentStack}</div>
      <pre>{JSON.stringify(error, null, 2)}</pre>
    </div>
  );
};
