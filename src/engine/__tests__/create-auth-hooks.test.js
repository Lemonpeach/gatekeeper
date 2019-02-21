import { FORBIDDEN_ERROR } from 'utils';

describe('create-auth-hook test', () => {
  const makeRule = type => ({
    type,
    actions: ['create'],
    toJSON: () => ({
      type, actions: ['create']
    })
  });

  beforeEach(() => {
    jest.mock('dot-prop-immutable', () => ({
      __esModule: true,
      default: { get: jest.fn(() => 'provider') }
    }));
  });

  afterEach(() => {
    jest.resetModules();
  });

  test('should resolve context when internally called', async () => {
    jest.mock('dot-prop-immutable', () => ({
      __esModule: true,
      default: { get: jest.fn(() => null) }
    }));
    const { createAuthHook } = require('../create-auth-hook');
    const context = { app: {
      service: jest.fn(() => ({ find: jest.fn() }))
    } };

    await expect(createAuthHook({})(context)).resolves.toEqual(context);
    expect(context.app.service().find).not.toHaveBeenCalled();
  });

  test('should reject when context has no rules', async () => {
    const { createAuthHook } = require('../create-auth-hook');
    const options = { ruleServiceName: 'users' };
    const findMock = jest.fn();
    const servicedMock = jest.fn(() => ({ find: findMock }));
    const context = {
      path: 'services/users/create',
      method: 'create',
      app: { service: servicedMock },
      params: {}
    };

    await expect(createAuthHook(options)(context)).rejects.toEqual(FORBIDDEN_ERROR);
    expect(context.app.service).toHaveBeenCalledWith(options.ruleServiceName);
    expect(findMock).toHaveBeenCalledWith({
      query: {
        serviceName: context.path,
        actions: { $contains: [context.method] }
      }
    });
    expect(context.params.rules).toEqual(undefined);
  });

  test('should resolve context when context has public rules', async () => {
    const { createAuthHook } = require('../create-auth-hook');
    const context = {
      path: 'services/users/create',
      method: 'create',
      app: { service: () => ({
        find: () => ([ makeRule('public') ])
      }) },
      params: { rules: makeRule('public').toJSON() }
    };

    await expect(createAuthHook({})(context)).resolves.toEqual(context);
  });

  describe('test when context has private-attribute rules', () => {
    const context = {
      path: 'services/users/create',
      method: 'create',
      app: { service: () => ({
        find: () => ([ makeRule('public-attribute') ])
      }) },
      params: { rules: makeRule('public-attribute').toJSON() }
    };
    const argsMock = { arg1: 'arg1' };
    const getArgumentsMock = jest.fn(() => argsMock);
    const onAuthorizedMock = jest.fn(() => Promise.resolve('public-attribute resolved'));
    const authenticateMock = jest.fn(context => context);
    let options = {
      ruleServiceName: 'users',
      getPrincipalId: 'user.id',
      attributeLookup: 'attribute lookup',
      getArguments: getArgumentsMock,
      onAuthorized: onAuthorizedMock,
      authenticate: authenticateMock
    };

    test('should return onAuthorized when is authorized', async () => {
      const { createAuthHook } = require('../create-auth-hook');
      const { castArray } = require('lodash');
      const isAuthorizedMock = jest.fn(() => true);
      options.isAuthorized = isAuthorizedMock;

      await expect(createAuthHook(options)(context)).resolves.toEqual('public-attribute resolved');
      expect(getArgumentsMock).toHaveBeenCalledWith(context);
      expect(isAuthorizedMock).toHaveBeenCalledWith({
        ...getArgumentsMock(),
        getPrincipalId: options.getPrincipalId,
        attributeLookup: options.attributeLookup,
        context,
        rules: castArray(context.params.rules)
      });
      expect(onAuthorizedMock).toHaveBeenCalledWith({
        context,
        args: getArgumentsMock(),
        authorized: isAuthorizedMock()
      });
      expect(authenticateMock).not.toHaveBeenCalled();
    });

    test('should call authenticate when is not authorized', async () => {
      const { createAuthHook } = require('../create-auth-hook');
      const isAuthorizedMock = jest.fn(() => false);
      options.isAuthorized = isAuthorizedMock;

      await expect(createAuthHook(options)(context)).resolves.toEqual('public-attribute resolved');
      expect(authenticateMock).toHaveBeenCalledWith(context);
      expect(isAuthorizedMock).toHaveBeenCalledWith({
        ...options.getArguments(),
        getPrincipalId: options.getPrincipalId,
        attributeLookup: options.attributeLookup,
        context: context
      });
      expect(onAuthorizedMock).toHaveBeenCalledWith({
        context,
        args: options.getArguments(),
        authorized: options.isAuthorized()
      });
    });
  });

  test('should resolve context when context has authenticated rules', async () => {
    const { createAuthHook } = require('../create-auth-hook');
    const context = {
      path: 'services/users/create',
      method: 'create',
      app: {
        service: () => ({
          find: () => ([ makeRule('authenticated') ])
        })
      },
      params: { rules: [ makeRule('authenticated').toJSON() ] }
    };
    const options = {
      getArguments: () => ({ arg1: 'arg1' }),
      authenticate: context => context
    };

    await expect(createAuthHook(options)(context)).resolves.toEqual(context);
  });

  test('should call onAuthorized when context has other rules', async () => {
    const { createAuthHook } = require('../create-auth-hook');
    const context = {
      path: 'services/users/create',
      method: 'create',
      app: {
        service: () => ({
          find: () => ([ makeRule('other-rule') ])
        })
      },
      params: { rules: [ makeRule('other-rule').toJSON() ] }
    };
    const onAuthorizedMock = jest.fn(() => Promise.resolve('other-rule resolved'));
    const isAuthorizedMock = jest.fn(() => false);
    let options = {
      ruleServiceName: 'users',
      getPrincipalId: 'user.id',
      attributeLookup: 'attribute lookup',
      getArguments: () => ({}),
      onAuthorized: onAuthorizedMock,
      isAuthorized: isAuthorizedMock,
      authenticate: context => context
    };

    await expect(createAuthHook(options)(context)).resolves.toEqual('other-rule resolved');
    expect(isAuthorizedMock).toHaveBeenCalledWith({
      ...options.getArguments(),
      getPrincipalId: options.getPrincipalId,
      attributeLookup: options.attributeLookup,
      context: context
    });
    expect(onAuthorizedMock).toHaveBeenCalledWith({
      context,
      args: options.getArguments(),
      authorized: options.isAuthorized()
    });
  });
});
