import { getUpdateArguments, FORBIDDEN_ERROR } from 'utils';
import { createAuthHook, isAuthorized } from 'engine';

export const update = options => createAuthHook({
  ...options,
  getArguments: getUpdateArguments,
  isAuthorized,
  onAuthorized: ({ context, authorized }) => (
    authorized ? Promise.resolve(context) : Promise.reject(FORBIDDEN_ERROR)
  )
});
