import createStore from './createStore';
import { transducerProtocol } from '../';
import { into, compose, map, filter, keep } from 'transducers.js';

function reducer(state, { type, payload }) {
  const { todos } = state;
  switch (type) {
  case 'ADD_TODO':
    return {
      ...state,
      todos: [
        ...todos,
        {
          ...payload,
          id: payload.id || state.idCounter
        }
      ],
      idCounter: state.idCounter + 1
    };
  case 'REMOVE_TODO':
    return { ...state, todos: todos.filter(t => t.id !== payload) };
  default:
    return state;
  }
}

describe('transducerProtocol()', () => {
  it('adds transducer protocol to store', () => {
    const store = transducerProtocol(createStore)(reducer, { todos: [], idCounter: 1 });

    const actions = [
      'Use Redux',
      'Weep with joy',
      'Mutate inside the reducer',
      null,
      'Learn about higher-order stores',
      { type: 'REMOVE_TODO', payload: 2 },
      'Learn about middleware'
    ];

    into(store, compose(
      keep(),
      map(a => typeof a === 'string'
        ? { type: 'ADD_TODO', payload: { text: a } }
        : a
      ),
      filter(a => {
        return !(
          a.type === 'ADD_TODO' &&
          /(M|m)utat(e|ion)/g.test(a.payload.text)
        );
      })
    ), actions);

    expect(store.getState()).to.deep.equal({
      todos: [
        { id: 1, text: 'Use Redux' },
        { id: 3, text: 'Learn about higher-order stores' },
        { id: 4, text: 'Learn about middleware' }
      ],
      idCounter: 5
    });
  });
});
