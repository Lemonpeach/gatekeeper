describe('hooks/update', () => {
  beforeEach(() => {
    jest.mock('engine', () => ({
      createAuthHook: jest.fn()
    }));
  });

  afterEach(() => {
    jest.resetModules();
  });

  test('should delegate to update auth hooks', () => {
    const { update } = require('../update');
    const options = {
      authenticate: () => {},
      ruleServiceName: 'authorization-rules',
      getPrincipalId: () => {},
      attributeLookup: {
        principalId: () => {}
      }
    };

    update(options);

    const { createAuthHook } = require('engine');
    const { getUpdateArguments } = require('utils');

    expect(createAuthHook).toHaveBeenCalledWith({
      ...options,
      getArguments: getUpdateArguments,
      onAuthorized: expect.any(Function)
    });
  });

  test('should resolve when authorized', async () => {
    const { update } = require('../update');
    const { createAuthHook } = require('engine');

    const options = { onAuthorized: await jest.fn() };
    const context = { authorized: true, context: 'resolved' };

    update(options);

    const { onAuthorized } = createAuthHook.mock.calls[0][0];
    return expect(onAuthorized(context)).resolves.toBe('resolved');
  });

  test('should reject when not authorized', async () => {
    const { update } = require('../update');
    const { createAuthHook } = require('engine');
    const { FORBIDDEN_ERROR } = require('utils');

    const options = { onAuthorized: await jest.fn() };
    const context = { authorized: false, context: 'resolved' };

    update(options);

    const { onAuthorized } = createAuthHook.mock.calls[0][0];
    return expect(onAuthorized(context)).rejects.toBe(FORBIDDEN_ERROR);
  });
});
