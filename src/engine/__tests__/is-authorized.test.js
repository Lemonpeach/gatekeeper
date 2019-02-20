import { merge, each } from 'lodash';

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
  }];

  test('should pass all', async () => {
    const { isAuthorized } = require('../');
    each(tests, async test => {
      await expect(isAuthorized(test.options)).resolves.toEqual(test.result);
    });
  });
});
