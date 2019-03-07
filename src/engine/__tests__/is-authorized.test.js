import { merge, map } from 'lodash';

describe('is-authorized test', () => {
  const options = {
    rules: [],
    data: [],
    toData: [],
    app: {
      service: jest.fn(() => ({
        find: jest.fn(() => [ /* roles */ ])
      }))
    },
    getPrincipalId: jest.fn(context => context.params.user.id),
    attributeLookup: {
      principalId: jest.fn(context => context.params.user.id)
    },
    context: { params: { user: { id: 1 } } }
  };

  afterEach(() => {
    jest.resetModules();
  });

  const tests = [{
    options: merge({}, options, {
      rules: [{
        type: 'attribute',
        resourceIdName: 'public',
        resourceIdValue: 'true'
      }],
      data: [
        { id: 1, public: true }
      ]
    }),
    result: true
  }, {
    options: merge({}, options, {
      rules: [{
        type: 'attribute',
        resourceIdName: 'public',
        resourceIdValue: 'true'
      }],
      data: [
        { id: 1, public: true },
        { id: 2, public: false }
      ]
    }),
    result: false
  }, {
    options: merge({}, options, {
      rules: [{
        type: 'attribute',
        resourceIdName: 'userId',
        resourceIdValue: 'principalId'
      }],
      data: [
        { id: 1, userId: '793b32c7-9ffe-4cc1-97f4-b7751e62d845' }
      ]
    }),
    result: false
  }, {
    options: merge({}, options, {
      rules: [{
        type: 'attribute',
        resourceIdName: 'userId',
        resourceIdValue: 'principalId'
      }],
      data: [
        { id: 1, userId: '793b32c7-9ffe-4cc1-97f4-b7751e62d845' },
        { id: 2, userId: '793b32c7-9ffe-4cc1-97f4-b7751e62d846' }
      ]
    }),
    result: false
  }];

  test('should pass all', async () => {
    const { isAuthorized } = require('../');
    await Promise.all(map(tests, async test => {
      await expect(isAuthorized(test.options)).resolves.toEqual(test.result);
    }));
  });
});
