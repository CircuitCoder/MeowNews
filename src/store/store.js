import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import * as reducers from './reducers';

const handlers = combineReducers(reducers);
const store = createStore(handlers, applyMiddleware(thunk));

export default store;
