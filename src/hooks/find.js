import { SKIP } from '@feathersjs/feathers';

import { getReadArguments } from 'utils';
import { createAuthHook, filterResponse } from 'engine';

export const find = options => createAuthHook({
  ...options,
  getArguments: getReadArguments,
  isAuthorized: filterResponse,
  onAuthorized: ({ authorized, context }) => {
    context.result = authorized; // eslint-disable-line
    return SKIP;
  }
});
