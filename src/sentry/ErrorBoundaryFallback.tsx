import { JSXElementConstructor, ReactElement } from 'react';
import * as Sentry from '@sentry/react';
import { Page } from 'components/Page';

type FallbackComponent =
  | ReactElement<any, string | JSXElementConstructor<any>>
  | Sentry.FallbackRender
  | undefined;

export const ErrorBoundaryFallback: FallbackComponent = ({
  error,
  componentStack,
}) => {
  return (
    <Page
      title={'Error'}
      subtitle={
        'An internal error occurred. Please try again or contact support.'
      }
    >
      <h3 className={'mb-5 text-secondary'}>Description</h3>
      <h2 className={'content-block p-20 bg-error/20 text-error'}>
        {error.name && `${error.name} - `} {error.message && error.message}
      </h2>

      <div className={'py-10'} />

      <h3 className={'mb-5 text-secondary'}>Component Stack</h3>
      <div className={'content-block p-20'}>{componentStack}</div>

      <div className={'py-10'} />

      <h3 className={'mb-5 text-secondary'}>Error JSON</h3>
      <div className={'content-block p-20'}>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    </Page>
  );
};
