describe('hooks/patch', () => {
  beforeEach(() => {
    jest.mock('engine', () => ({
      createAuthHook: jest.fn()
    }));
  });

  afterEach(() => {
    jest.resetModules();
  });

  test('should delegate to patch auth hooks', () => {
    const { patch } = require('../patch');
    const options = {
      authenticate: () => {},
      ruleServiceName: 'authorization-rules',
      getPrincipalId: () => {},
      attributeLookup: {
        principalId: () => {}
      }
    };

    patch(options);

    const { createAuthHook } = require('engine');
    const { getPatchArguments } = require('utils');

    expect(createAuthHook).toHaveBeenCalledWith({
      ...options,
      getArguments: getPatchArguments,
      onAuthorized: expect.any(Function)
    });
  });

  test('should resolve when authorized', async () => {
    const { patch } = require('../patch');
    const { createAuthHook } = require('engine');

    const options = { onAuthorized: await jest.fn() };
    const context = { authorized: true, context: 'resolved' };

    patch(options);

    const { onAuthorized } = createAuthHook.mock.calls[0][0];
    return expect(onAuthorized(context)).resolves.toBe('resolved');
  });

  test('should reject when not authorized', async () => {
    const { patch } = require('../patch');
    const { createAuthHook } = require('engine');
    const { FORBIDDEN_ERROR } = require('utils');

    const options = { onAuthorized: await jest.fn() };
    const context = { authorized: false, context: 'resolved' };

    patch(options);

    const { onAuthorized } = createAuthHook.mock.calls[0][0];
    return expect(onAuthorized(context)).rejects.toBe(FORBIDDEN_ERROR);
  });
});
