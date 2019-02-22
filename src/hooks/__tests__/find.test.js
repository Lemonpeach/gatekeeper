describe('hooks/find', () => {
  beforeEach(() => {
    jest.mock('engine', () => ({
      createAuthHook: jest.fn()
    }));
  });

  afterEach(() => {
    jest.resetModules();
  });

  test('should delegate to find auth hooks', () => {
    const { find } = require('../find');
    const options = {
      authenticate: () => {},
      ruleServiceName: 'authorization-rules',
      getPrincipalId: () => {},
      attributeLookup: {
        principalId: () => {}
      }
    };

    find(options);

    const { createAuthHook } = require('engine');
    const { getReadArguments, filterResponse } = require('utils');

    expect(createAuthHook).toHaveBeenCalledWith({
      ...options,
      isAuthorized: filterResponse,
      getArguments: getReadArguments,
      onAuthorized: expect.any(Function)
    });
  });

  test('should skip when authorized', () => {
    const { find } = require('../find');
    const { createAuthHook } = require('engine');
    const { SKIP } = require('@feathersjs/feathers');
    const options = {
      authorized: true,
      context: {}
    };

    find({});

    const { onAuthorized } = createAuthHook.mock.calls[0][0];
    expect(onAuthorized(options)).toBe(SKIP);
    expect(options.context.result).toBe(true);
  });
});
