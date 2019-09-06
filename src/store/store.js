import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { persistReducer, persistStore } from 'redux-persist'
import ExpoFileSystemStorage from 'redux-persist-expo-filesystem';
import immutableTransform from 'redux-persist-transform-immutable';

import * as reducers from './reducers';

const persistConfig = {
  transforms: [immutableTransform()],
  key: 'root',
  storage: ExpoFileSystemStorage,
  timeout: 0,
};

const handlers = combineReducers(reducers);
const persisted = persistReducer(persistConfig, handlers);

export default () => {
  const store = createStore(persisted, undefined, applyMiddleware(thunk));
  const persistor = persistStore(store, null);

  return { store, persistor };
};
