describe('hooks/create', () => {
  beforeEach(() => {
    jest.mock('engine', () => ({
      createAuthHook: jest.fn()
    }));
  });

  afterEach(() => {
    jest.resetModules();
  });

  test('should delegate to create auth hooks', async () => {
    const { create } = require('../create');
    const options = {
      authenticate: () => {},
      ruleServiceName: 'authorization-rules',
      getPrincipalId: () => {},
      attributeLookup: {
        principalId: () => {}
      }
    };

    create(options);

    const { createAuthHook } = require('engine');
    const { getCreateArguments } = require('utils');

    expect(createAuthHook).toHaveBeenCalledWith({
      ...options,
      getArguments: getCreateArguments,
      onAuthorized: expect.any(Function)
    });
  });

  test('should resolve when authorized', async () => {
    const { create } = require('../create');
    const { createAuthHook } = require('engine');

    const options = { onAuthorized: await jest.fn() };
    const context = { 'authorized': true, context: 'resolved' };

    create(options);

    const { onAuthorized } = createAuthHook.mock.calls[0][0];
    return expect(onAuthorized(context)).resolves.toBe('resolved');
  });

  test('should reject when not authorized', async () => {
    const { create } = require('../create');
    const { createAuthHook } = require('engine');
    const { FORBIDDEN_ERROR } = require('utils');

    const options = { onAuthorized: await jest.fn() };
    const context = { 'authorized': false, context: 'resolved' };

    create(options);

    const { onAuthorized } = createAuthHook.mock.calls[0][0];
    return expect(onAuthorized(context)).rejects.toBe(FORBIDDEN_ERROR);
  });
});
