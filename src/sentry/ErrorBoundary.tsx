import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import { ReactNode } from 'react';
import { ErrorBoundaryFallback } from 'sentry/ErrorBoundaryFallback';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  integrations: [new BrowserTracing()],

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

export const SentryErrorBoundary = ({ children }: { children: ReactNode }) => {
  return (
    // @ts-ignore
    <Sentry.ErrorBoundary fallback={ErrorBoundaryFallback}>
      {children}
    </Sentry.ErrorBoundary>
  );
};
