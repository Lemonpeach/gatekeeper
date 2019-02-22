describe('hooks/get', () => {
  beforeEach(() => {
    jest.mock('engine', () => ({
      createAuthHook: jest.fn()
    }));
  });

  afterEach(() => {
    jest.resetModules();
  });

  test('should delegate to get auth hooks', async () => {
    const { get } = require('../get');
    const options = {
      authenticate: () => {},
      ruleServiceName: 'authorization-rules',
      getPrincipalId: () => {},
      attributeLookup: {
        principalId: () => {}
      }
    };

    get(options);

    const { createAuthHook } = require('engine');
    const { getReadArguments } = require('utils');

    expect(createAuthHook).toHaveBeenCalledWith({
      ...options,
      getArguments: getReadArguments,
      onAuthorized: expect.any(Function)
    });
  });

  test('should skip when authorized', () => {
    const { get } = require('../get');
    const { createAuthHook } = require('engine');
    const { SKIP } = require('@feathersjs/feathers');
    const options = {
      authorized: true,
      context: {},
      args: {
        data: 'hello'
      }
    };

    get({});

    const { onAuthorized } = createAuthHook.mock.calls[0][0];
    expect(onAuthorized(options)).toBe(SKIP);
    expect(options.context.result).toBe('hello');
  });

  test('should reject when not authorized', () => {
    const { get } = require('../get');
    const { createAuthHook } = require('engine');
    const { FORBIDDEN_ERROR } = require('utils');

    const options = { onAuthorized: jest.fn() };
    const context = { authorized: false, context: 'resolved' };

    get(options);

    const { onAuthorized } = createAuthHook.mock.calls[0][0];
    return expect(onAuthorized(context)).rejects.toBe(FORBIDDEN_ERROR);
  });
});
