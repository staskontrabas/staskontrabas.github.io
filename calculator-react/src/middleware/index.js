export function thunk(store) {
  return function(dispatch) {
    return function(action) {
      if(typeof action === 'function') {
        action(dispatch, store.getState) // invoke the action
      }
      else {
        return dispatch(action) // dispatch normally
      }
    }
  }
}