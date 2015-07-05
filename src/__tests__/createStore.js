// Mock createStore() until 1.0 is released
export default function createStore(reducer, initialState) {
  let state = initialState;
  return {
    getState: () => state,
    dispatch: action => state = reducer(state, action)
  };
}
