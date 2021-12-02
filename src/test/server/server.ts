import { setupServer } from 'msw/node';

import { handlers } from 'test/server/handlers/index';

export const server = setupServer(...handlers);
