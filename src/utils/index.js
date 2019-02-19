import Errors from '@feathersjs/errors';
import dotprop from 'dot-prop-immutable';
import { omit, chain, merge } from 'lodash';

export const FORBIDDEN_ERROR = new Errors.Forbidden('Nice try.');

const extractToData = context => dotprop.get(context, 'data');
const extractRules = context => dotprop.get(context, 'params.rules');
const extractApp = context => dotprop.get(context, 'app');
const extractCommon = context => ({
  rules: extractRules(context),
  app: extractApp(context)
});

const getData = async context => {
  const params = omit(context.params, ['provider']);
  return context.id
    ? context.service.get(context.id, params)
    : context.service.find(params);
};

export const getReadArguments = async context => {
  const data = await getData(context);
  return { ...extractCommon(context), data };
};

export const getCreateArguments = context => Promise.resolve({
  ...extractCommon(context),
  toData: extractToData(context)
});

export const getUpdateArguments = async context => {
  const data = await getData(context);
  return {
    ...extractCommon(context),
    toData: extractToData(context),
    data
  };
};

export const getPatchArguments = async context => {
  const data = await getData(context);
  const partialToData = extractToData(context);
  const item = chain(data).defaultTo({}).castArray().head().value();
  const toData = merge(
    {},
    item.toJSON ? item.toJSON() : item,
    partialToData
  );
  return {
    ...extractCommon(context),
    toData,
    data
  };
};

export const getRemoveArguments = async context => {
  const data = await getData(context);
  return { ...extractCommon(context), data };
};
