import { rest } from 'msw';

import { API_URL } from 'config';

import { delayedResponse } from 'test/server/utils';

import * as data from 'test/server/handlers/welcome-data.json';


export const welcomeHandlers = [
  rest.get(`${API_URL}/welcome`, (_req, _res, ctx) => {
    try {
      return delayedResponse(ctx.json(data));
    } catch (error: any) {
      return delayedResponse(
        ctx.status(400),
        ctx.json({ message: error?.message || 'Server Error' })
      );
    }
  }),
];
