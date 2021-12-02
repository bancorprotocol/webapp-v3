import { setupWorker } from 'msw';

import { handlers } from 'test/server/handlers/index';

export const worker = setupWorker(...handlers);
