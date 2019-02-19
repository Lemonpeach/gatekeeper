import dotprop from 'dot-prop-immutable';
import { find, map, isNil, castArray } from 'lodash';

import { FORBIDDEN_ERROR } from 'utils';

const isInternalCall = context => {
  const provider = dotprop.get(context, 'params.provider');
  return isNil(provider);
};

const hasRules = rules => (
  rules.length !== 0
);

export const createAuthHook = ({
  ruleServiceName,
  authenticate,
  getPrincipalId,
  attributeLookup,
  getArguments,
  isAuthorized,
  onAuthorized
}) => async context => {
  if (isInternalCall(context)) {
    return context;
  }

  let rules = await context.app.service(ruleServiceName).find({
    query: {
      serviceName: context.path,
      actions: { $contains: [context.method] }
    }
  });

  rules = map(rules, rule => rule.toJSON());

  if (!hasRules(rules)) {
    return Promise.reject(FORBIDDEN_ERROR);
  }

  context.params.rules = rules; // eslint-disable-line

  const publicRules = find(
    rules,
    { type: 'public', actions: [context.method] }
  );

  if (publicRules) {
    return Promise.resolve(context);
  }

  const args = await getArguments(context);

  const publicAttributes = find(
    rules,
    { type: 'public-attribute', actions: [context.method] }
  );

  if (publicAttributes) {
    const authorized = await isAuthorized({
      ...args,
      getPrincipalId,
      attributeLookup,
      context,
      rules: castArray(publicAttributes)
    });

    if (authorized) {
      return onAuthorized({ context, args, authorized });
    }
  }

  context = await authenticate(context); // eslint-disable-line

  const isAuthenticated = find(
    rules,
    { type: 'authenticated', actions: [context.method] }
  );

  if (isAuthenticated) {
    return Promise.resolve(context);
  }

  const authorized = await isAuthorized({
    ...args,
    getPrincipalId,
    attributeLookup,
    context
  });

  return onAuthorized({ context, args, authorized });
};
