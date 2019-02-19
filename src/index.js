import { find, get, create, update, patch, remove } from './hooks';

export default options => ({
  before: {
    find: find(options),
    get: get(options),
    create: create(options),
    update: update(options),
    patch: patch(options),
    remove: remove(options)
  }
});
