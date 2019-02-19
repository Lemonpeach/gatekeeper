import { getPatchArguments, FORBIDDEN_ERROR } from 'utils';
import { createAuthHook, isAuthorized } from 'engine';

export const patch = options => createAuthHook({
  ...options,
  getArguments: getPatchArguments,
  isAuthorized,
  onAuthorized: ({ context, authorized }) => (
    authorized ? Promise.resolve(context) : Promise.reject(FORBIDDEN_ERROR)
  )
});
