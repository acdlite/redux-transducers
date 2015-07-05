import transduce from '../';
import transducers1 from 'transducers.js';
import transducers2 from 'transducers-js';

// Mock createStore
function createStore(reducer, initialState) {
  let state = initialState;
  return {
    getState: () => state,
    dispatch: action => state = reducer(state, action)
  };
}

// Test with both transducers-js and transducers.js libraries
function testTransduce(compose, remove, filter, map) {
  const appendReducer = (state, action) => {
    return {
      string: state.string + action.payload
    };
  };

  const reducer = transduce(
    compose(
      remove(action => !action),
      filter(action => action.type === 'APPEND'),
      map(action => ({...action, payload: action.payload.toUpperCase()})),
    ),
    appendReducer
  );

  const store = createStore(reducer, { string: '' });

  store.dispatch(null);
  store.dispatch({ type: 'APPEND', payload: 'a' });
  store.dispatch(undefined);
  store.dispatch({ type: 'APPEND', payload: 'b' });
  store.dispatch({ type: 'DONT_APPEND', payload: 'c' });
  store.dispatch({ type: 'APPEND', payload: 'd' });

  expect(store.getState()).to.deep.equal({ string: 'ABD' });
}

describe('transduce', () => {
  describe('creates a reducer from a transducer and a reducer', () => {
    it('works with transducers.js', () => {
      const { compose, remove, filter, map } = transducers1;
      testTransduce(compose, remove, filter, map);
    });

    it('works with transducers-js', () => {
      const { comp: compose, remove, filter, map } = transducers2;
      testTransduce(compose, remove, filter, map);
    });
  });
});
