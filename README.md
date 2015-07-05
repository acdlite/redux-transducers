redux-transduce
===============

[![build status](https://img.shields.io/travis/acdlite/redux-transduce/master.svg?style=flat-square)](https://travis-ci.org/acdlite/redux-transduce)
[![npm version](https://img.shields.io/npm/v/redux-transduce.svg?style=flat-square)](https://www.npmjs.com/package/redux-transduce)

Use transducers to create Redux reducers. Conforms to the [transducer protocol](https://github.com/cognitect-labs/transducers-js#the-transducer-protocol) used by [transducers.js](https://github.com/jlongster/transducers.js) and [transducers-js](https://github.com/cognitect-labs/transducers-js), and is tested against those libraries.

```js
npm install --save redux-transduce
```

## `transduce(xform, reducer)`

`transduce()` creates a reducer from a transducer and a base reducer. The transformation is applied before being sent to the base reducer.


## Caveat: not all transducers are supported

Transducers typically operate on collections. It's possible to use transducers to transform asynchronous streams, but it requires the use of local state that persists over time. We can't do this, because Redux makes a hard assumption that the reducer is a pure function -- it must return the same result for a given state and action, every time.

For this reason, `transduce()` transforms actions one at a time. That means transducers like `filter()` and `map()` work fine, but `take()` and `dedupe()` do not.


## Simple example: filtering action types

```js
import { filter } from 'transducers.js';
import transduce from 'redux-transduce';

const addTodoReducer = transduce(
  filter(action => action.type === 'ADD_TODO'),
  (state, action) => ({ ...state, todos: [...state.todos, action.payload })
);

const removeTodoReducer = transduce(
  filter(action => action.type === 'ADD_TODO'),
  (state, action) => ({ ...state, todos: todos.filter(t => t.id !== action.payload.id) })
);

// Combine into a single reducer with reduce-reducers
// https://github.com/acdlite/reduce-reducers
import reduceReducers from 'reduce-reducers';
const todoReducer = reduceReducers(addTodoReducer, removeTodoReducer);
```
