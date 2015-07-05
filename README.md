redux-transducers
=================

[![build status](https://img.shields.io/travis/acdlite/redux-transducers/master.svg?style=flat-square)](https://travis-ci.org/acdlite/redux-transducers)
[![npm version](https://img.shields.io/npm/v/redux-transducers.svg?style=flat-square)](https://www.npmjs.com/package/redux-transducers)

Transducer utilities for Redux.

- `transducerProtocol` lets you dispatch using transducers.
- `transduce()` lets you create reducers from transducers.

Conforms to the [transducer protocol](https://github.com/cognitect-labs/transducers-js#the-transducer-protocol) used by [transducers.js](https://github.com/jlongster/transducers.js) and [transducers-js](https://github.com/cognitect-labs/transducers-js), and is tested against those libraries.

```js
npm install --save redux-transducers
```
## Using transducers to dispatch actions

### `transducerProtocol(createStore)`

This is a *higher-order store* that enables a Redux store to be dispatched via a transducer. Higher-order stores aren't currently documented ([it's coming](https://github.com/gaearon/redux/pull/140)) but they're simple to use:

```js
const newCreateStore = transducerProtocol(createStore);
const store = newCreateStore(reducer, initialState);
```

That's it! Now you can dispatch actions to you stores using transducers.

**NOTE**: If you're using other higher-order stores, like the forthcoming [`applyMiddleware()`](https://github.com/gaearon/redux/pull/213), `transducerProtocol` *must* come first in the chain. This is because, in order to conform to the transducer protocol, and for compatibility with popular transducer libraries, the store returned by `transducerProtocol()` is not a plain object. This shouldn't be a problem. Just remember to always put first.

```js
// This won't work
const newCreateStore = compose(applyMiddleware(m1, m2, m3), transducerProtocol, createStore);
// Do this instead
const newCreateStore = compose(transducerProtocol, applyMiddleware(m1, m2, m3), createStore);
```

### How it works

The best way to explain this is probably just to show you an example:

### Example: mapping strings to actions

```js
// Using the transducers.js library
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
```

This example uses the [`into(to, xform, from)`](https://github.com/jlongster/transducers.js#applying-transformations) function of transducers.js. It applies a transformation to each action in a collection — in this case an array, but could be any iterable data structure — and "pours" it into the target collection — in this case, a store — by performing a dispatch. The call to `store.dispatch()` is analogous to a call to `array.push()`.

## Using transducers to create reducers

### `transduce(xform, reducer)`

`transduce()` creates a reducer from a transducer and a base reducer. The transformation is applied before being sent to the base reducer.

### Caveat: `transduce()` does not support stateful transducers

Transducers typically operate on collections. It's possible to use transducers to transform asynchronous streams, but it requires the use of local state that persists over time. We can't do this, because Redux makes a hard assumption that the reducer is a pure function — it must return the same result for a given state and action, every time.

For this reason, `transduce()` transforms actions one at a time. That means transducers like `filter()` and `map()` work fine, but `take()` and `dedupe()` do not.

This caveat **does not apply to `transducerProtocol()`**, which works with all transducers, stateful or otherwise, because it does its transforms *before* they reach the reducer.

### Example: filtering action types

```js
import { filter } from 'transducers.js';
import transduce from 'redux-transducers';

const addTodoReducer = transduce(
  filter(action => action.type === 'ADD_TODO'),
  (state, action) => ({ ...state, todos: [...state.todos, action.payload })
);

const removeTodoReducer = transduce(
  filter(action => action.type === 'REMOVE_TODO'),
  (state, action) => ({ ...state, todos: state.todos.filter(t => t.id !== action.payload.id) })
);

// Combine into a single reducer with reduce-reducers
// https://github.com/acdlite/reduce-reducers
import reduceReducers from 'reduce-reducers';
const todoReducer = reduceReducers(addTodoReducer, removeTodoReducer);
```
