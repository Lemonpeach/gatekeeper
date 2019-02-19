import { getCreateArguments, FORBIDDEN_ERROR } from 'utils';
import { createAuthHook, isAuthorized } from 'engine';

export const create = options => createAuthHook({
  ...options,
  getArguments: getCreateArguments,
  isAuthorized,
  onAuthorized: ({ authorized, context }) => (
    authorized ? Promise.resolve(context) : Promise.reject(FORBIDDEN_ERROR)
  )
});
