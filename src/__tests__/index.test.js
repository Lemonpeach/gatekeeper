import gatekeeper from '../index';

describe('index', () => {
  test('should export hooks', () => {
    expect(gatekeeper({})).toEqual({
      before: {
        find: expect.any(Function),
        get: expect.any(Function),
        create: expect.any(Function),
        update: expect.any(Function),
        patch: expect.any(Function),
        remove: expect.any(Function)
      }
    });
  });
});
