import { createResponseComposition, context } from 'msw';

const isTesting = process.env.NODE_ENV === 'test' || ((window as any).Cypress as any);

export const delayedResponse = createResponseComposition(undefined, [
  context.delay(isTesting ? 0 : 1000),
]);
