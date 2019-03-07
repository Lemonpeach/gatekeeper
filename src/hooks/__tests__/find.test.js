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

  test('should return context when authorized', async () => {
    const { find } = require('../find');
    const { createAuthHook } = require('engine');
    const options = {
      authorized: true,
      context: {
        data: 'one'
      }
    };

    find({});

    const { onAuthorized } = createAuthHook.mock.calls[0][0];
    const context = await onAuthorized(options);

    expect(context).toEqual({ data: 'one', result: true });
    expect(options.context.result).toBe(true);
  });
});
