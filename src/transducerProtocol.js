import { INIT, STEP, RESULT } from './constants';

class Store {
  constructor(store) {
    this.store = store;
    Object.assign(this, store);
  }

  [INIT]() {
    return this;
  }

  [STEP](store, action) {
    store.dispatch(action);
    return store;
  }

  [RESULT](store) {
    return store;
  }
}

export default function transducerProtocol(next) {
  return (...args) => new Store(next(...args));
}
