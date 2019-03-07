import { getReadArguments, FORBIDDEN_ERROR } from 'utils';
import { createAuthHook, isAuthorized } from 'engine';

export const get = options => createAuthHook({
  ...options,
  getArguments: getReadArguments,
  isAuthorized,
  onAuthorized: ({ authorized, args, context }) => {
    if (!authorized) {
      return Promise.reject(FORBIDDEN_ERROR);
    }
    context.result = args.data; // eslint-disable-line
    return Promise.resolve(context);
  }
});
