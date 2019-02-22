describe('hooks/remove', () => {
  beforeEach(() => {
    jest.mock('engine', () => ({
      createAuthHook: jest.fn()
    }));
  });

  afterEach(() => {
    jest.resetModules();
  });

  test('should delegate to create auth hooks', () => {
    const { remove } = require('../remove');
    const options = {
      authenticate: () => {},
      ruleServiceName: 'authorization-rules',
      getPrincipalId: () => {},
      attributeLookup: {
        principalId: () => {}
      }
    };

    remove(options);

    const { createAuthHook } = require('engine');
    const { getRemoveArguments } = require('utils');

    expect(createAuthHook).toHaveBeenCalledWith({
      ...options,
      getArguments: getRemoveArguments,
      onAuthorized: expect.any(Function)
    });
  });

  test('should resolve when authorized', () => {
    const { remove } = require('../remove');
    const { createAuthHook } = require('engine');

    const options = { onAuthorized: jest.fn() };
    const context = { authorized: true, context: 'resolved' };

    remove(options);

    const { onAuthorized } = createAuthHook.mock.calls[0][0];
    return expect(onAuthorized(context)).resolves.toBe('resolved');
  });

  test('should reject when not authorized', () => {
    const { create } = require('../create');
    const { createAuthHook } = require('engine');
    const { FORBIDDEN_ERROR } = require('utils');

    const options = { onAuthorized: jest.fn() };
    const context = { authorized: false, context: 'resolved' };

    create(options);

    const { onAuthorized } = createAuthHook.mock.calls[0][0];
    return expect(onAuthorized(context)).rejects.toBe(FORBIDDEN_ERROR);
  });
});
