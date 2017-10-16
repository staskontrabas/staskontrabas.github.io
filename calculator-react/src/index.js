import React from 'react';
import { render } from 'react-dom'
import { createStore, applyMiddleware } from 'redux'//, applyMiddleware
import { Provider } from 'react-redux'
import Calculator from './containers/Calculator';
import reducer from './reducers'
import thunk from 'redux-thunk';
//import { thunk } from './middleware'

const store = createStore(reducer, applyMiddleware(thunk))


render(
  <Provider store={store}>
    <Calculator />
  </Provider>,
  document.getElementById('root')//querySelector('body')//
)
