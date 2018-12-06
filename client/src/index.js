import React from 'react';
import ReactDOM from 'react-dom';
import {
  createStore,
  applyMiddleware,
} from 'redux';
import {
  Provider,
} from 'react-redux';
import thunk from 'redux-thunk';
import App from './App';
import reducer from './reducers/reducer';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

const app = document.getElementById('root');

const store = createStore(reducer, applyMiddleware(thunk));

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  app,
);
