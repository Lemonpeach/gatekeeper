import { getRemoveArguments, FORBIDDEN_ERROR } from 'utils';
import { createAuthHook, isAuthorized } from 'engine';

export const remove = options => createAuthHook({
  ...options,
  getArguments: getRemoveArguments,
  isAuthorized,
  onAuthorized: ({ context, authorized }) => (
    authorized ? Promise.resolve(context) : Promise.reject(FORBIDDEN_ERROR)
  )
});
