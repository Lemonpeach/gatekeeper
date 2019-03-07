import {
  chain, map, includes, find, castArray, filter, isNil, concat, defaultTo
} from 'lodash';
import dotprop from 'dot-prop-immutable';

const castBoolean = value => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
};

const lookupEntitlements = ({
  principalId, rule, data, app
}) => {
  let queryItems = [];

  if (isNil(rule.resourceIdName)) {
    queryItems = [{
      [rule['authorization-role'].principalIdName]: principalId
    }];
  } else {
    queryItems = chain(data)
      .map(item => item[rule.resourceIdName])
      .uniq()
      .map(id => ({
        [rule['authorization-role'].resourceIdName]: id,
        [rule['authorization-role'].principalIdName]: principalId
      }))
      .value();
  }

  return app.service(rule['authorization-role'].serviceName).find({
    query: {
      $or: queryItems
    }
  });
};

const checkRoleEntitlement = ({
  principalId, item, rule, entitlements
}) => {
  const query = {
    [rule['authorization-role'].principalIdName]: principalId
  };

  if (!isNil(rule.resourceIdName)) {
    query[rule['authorization-role'].resourceIdName] = item[rule.resourceIdName];
  }

  return !!find(entitlements, query);
};

const checkAttributeEntitlement = ({
  item,
  rule,
  attributeLookup,
  context
}) => {
  if (isNil(rule.resourceIdValue)) {
    return false;
  }

  const dynamicAttribute = dotprop.get(
    defaultTo(rule.resourceIdValue.match(/\${(.*)}/), []),
    '1'
  );

  if (isNil(dynamicAttribute)) {
    return item[rule.resourceIdName] === castBoolean(rule.resourceIdValue);
  }

  const lookup = attributeLookup[dynamicAttribute];

  if (isNil(lookup)) {
    return false;
  }

  const value = lookup(context);

  return item[rule.resourceIdName] === value;
};

const checkEntitlements = ({
  principalId,
  item,
  roleRules,
  attributeRules,
  entitlements,
  attributeLookup,
  context
}) => {
  const authorizedByRole = map(
    roleRules,
    (rule, index) => checkRoleEntitlement({
      principalId, item, rule, entitlements: entitlements[index]
    })
  );

  const authorizedByAttribute = map(
    attributeRules,
    rule => checkAttributeEntitlement({
      item, rule, attributeLookup, context
    })
  );

  return includes(authorizedByRole, true) || includes(authorizedByAttribute, true);
};

const getAuthorization = async ({
  rules,
  data = [],
  toData = [],
  app,
  getPrincipalId,
  attributeLookup,
  context
}) => {
  const _data = concat(castArray(data), castArray(toData));
  const roleRules = filter(rules, { type: 'role' });
  const attributeRules = filter(rules, rule => (
    rule.type === 'attribute' || rule.type === 'public-attribute'
  ));

  const principalId = await getPrincipalId(context);

  // Lookup user entitlements for each role rule governing this resource.
  const entitlements = await Promise.all(map(
    roleRules,
    rule => lookupEntitlements({
      principalId, rule, data: _data, app
    })
  ));

  // Lookup user entitlements for each rule against each resource this request
  // is acting against.
  return map(
    _data,
    item => ({
      item,
      authorized: checkEntitlements({
        principalId,
        item,
        roleRules,
        attributeRules,
        entitlements,
        attributeLookup,
        context
      })
    })
  );
};

// Checks if user is authorized to act against each resource.
export const isAuthorized = async options => {
  const lookup = await getAuthorization(options);
  return !chain(lookup)
    .map(item => item.authorized)
    .includes(false)
    .value();
};

// Filters the items being read by authorization.
// This is used exclusively when running a find.
export const filterResponse = async options => {
  const lookup = await getAuthorization(options);
  return chain(lookup)
    .filter(item => item.authorized)
    .map(item => item.item)
    .value();
};
