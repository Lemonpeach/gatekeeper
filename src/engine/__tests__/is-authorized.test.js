import { merge, map } from 'lodash';

describe('is-authorized type role test', () => {
  const options = {
    rules: [],
    app: {
      service: jest.fn(() => ({
        find: jest.fn(() => [{
          id: 1,
          userId: '793b32c7-9ffe-4cc1-97f4-b7751e62d845',
          someId: '9B4FC7B9-BF0D-4A9E-9017-51F97871593A'
        }])
      }))
    },
    getPrincipalId: jest.fn(context => context.params.user.id),
    attributeLookup: {
      principalId: jest.fn(context => context.params.user.id)
    },
    context: { params: { user: { id: '793b32c7-9ffe-4cc1-97f4-b7751e62d845' } } }
  };

  const tests = {
    isBusinessIdMatch: {
      options: merge({}, options, {
        rules: [{
          type: 'role',
          resourceIdName: 'someId',
          resourceIdValue: 'principalId',
          fields: ['*'],
          'authorization-role': {
            principalIdName: 'userId',
            resourceIdName: 'someId',
            serviceName: 'test'
          }
        }],
        data: [{
          id: 1,
          userId: '793b32c7-9ffe-4cc1-97f4-b7751e62d845',
          someId: '9B4FC7B9-BF0D-4A9E-9017-51F97871593A'
        }]
      }),
      result: true
    },
    isFieldsMatch: {
      options: merge({}, options, {
        rules: [{
          type: 'role',
          resourceIdValue: 'principalId',
          fields: ['name', 'userId', 'id'],
          'authorization-role': {
            principalIdName: 'userId',
            serviceName: 'test'
          }
        }],
        data: [{
          id: 1,
          userId: '793b32c7-9ffe-4cc1-97f4-b7751e62d845',
          name: 'french fries'
        }]
      }),
      result: true
    },
    isFieldsUnMatch: {
      options: merge({}, options, {
        rules: [{
          type: 'role',
          resourceIdValue: 'principalId',
          fields: ['userId', 'id'],
          'authorization-role': {
            principalIdName: 'userId',
            serviceName: 'test'
          }
        }],
        data: [{
          id: 1,
          userId: '793b32c7-9ffe-4cc1-97f4-b7751e62d845',
          firstName: 'french',
          lastName: 'fries'
        }]
      }),
      result: false
    },
    isNoResourceIdValue: {
      options: merge({}, options, {
        rules: [{
          type: 'role',
          fields: ['*'],
          'authorization-role': {
            principalIdName: 'userId',
            serviceName: 'test'
          }
        }],
        data: [{
          id: 1,
          userId: '793b32c7-9ffe-4cc1-97f4-b7751e62d845'
        }]
      }),
      result: true
    }
  };

  afterEach(() => {
    jest.resetModules();
  });

  test('should pass all', async () => {
    const { isAuthorized } = require('../');
    await Promise.all(map(tests, async test => {
      await expect(isAuthorized(test.options)).resolves.toEqual(test.result);
    }));
  });
});

describe('is-authorized type attribute test', () => {
  const options = {
    rules: [],
    app: {
      service: jest.fn(() => ({
        find: jest.fn(() => [ /* roles */ ])
      }))
    },
    getPrincipalId: jest.fn(context => context.params.user.id),
    attributeLookup: {
      principalId: jest.fn(context => context.params.user.id),
      nullId: null
    },
    context: { params: { user: { id: '793b32c7-9ffe-4cc1-97f4-b7751e62d845' } } }
  };

  const tests = {
    isResourceMatch: {
      options: merge({}, options, {
        rules: [{
          type: 'attribute',
          resourceIdName: 'public',
          resourceIdValue: 'true',
          fields: ['*']
        }],
        data: [
          { id: 1, public: true }
        ]
      }),
      result: true
    },
    isPrincipalUnmatch: {
      options: merge({}, options, {
        rules: [{
          type: 'attribute',
          resourceIdName: 'public',
          resourceIdValue: 'true',
          fields: ['*']
        }],
        data: [
          { id: 1, public: true },
          { id: 2, public: false }
        ]
      }),
      result: false
    },
    isMissingResourceIdValue: {
      options: merge({}, options, {
        rules: [{
          type: 'attribute',
          resourceIdName: 'public',
          fields: ['*']
        }],
        data: [
          { id: 1, public: true },
          { id: 2, public: false }
        ]
      }),
      result: false
    },
    isUserIdMatch: {
      options: merge({}, options, {
        rules: [{
          type: 'attribute',
          resourceIdName: 'userId',
          resourceIdValue: '793b32c7-9ffe-4cc1-97f4-b7751e62d845',
          fields: ['*']
        }],
        data: [{
          id: 1,
          userId: '793b32c7-9ffe-4cc1-97f4-b7751e62d845'
        }]
      }),
      result: true
    },
    isUserIdUnMatch: {
      options: merge({}, options, {
        rules: [{
          type: 'attribute',
          resourceIdName: 'userId',
          resourceIdValue: '793b32c7-9ffe-4cc1-97f4-b7751e62d846',
          fields: ['*']
        }],
        data: [
          { id: 1, userId: '793b32c7-9ffe-4cc1-97f4-b7751e62d845' },
          { id: 2, userId: '793b32c7-9ffe-4cc1-97f4-b7751e62d846' }
        ]
      }),
      result: false
    },
    isDyanmicResourceMatch: {
      options: merge({}, options, {
        rules: [{
          type: 'attribute',
          resourceIdName: 'userId',
          resourceIdValue: '${principalId}', /* eslint-disable-line no-template-curly-in-string */
          fields: ['*']
        }],
        data: [{
          id: 1,
          userId: '793b32c7-9ffe-4cc1-97f4-b7751e62d845'
        }]
      }),
      result: true
    },
    isDyanmicResourceUnMatch: {
      options: merge({}, options, {
        rules: [{
          type: 'attribute',
          resourceIdName: 'userId',
          resourceIdValue: '${nullId}', /* eslint-disable-line no-template-curly-in-string */
          fields: ['*']
        }],
        data: [{
          id: 1,
          userId: '793b32c7-9ffe-4cc1-97f4-b7751e62d845'
        }]
      }),
      result: false
    }
  };

  afterEach(() => {
    jest.resetModules();
  });

  test('should pass all', async () => {
    const { isAuthorized } = require('../');
    await Promise.all(map(tests, async test => {
      await expect(isAuthorized(test.options)).resolves.toEqual(test.result);
    }));
  });
});
