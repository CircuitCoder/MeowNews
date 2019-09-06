import { List, Map } from 'immutable';

import { ALL_CATEGORIES } from '../config';

export function categories(state=List(ALL_CATEGORIES), action) {
  return state;
}

export function lists(state=Map(), action) {
  if(action.type === 'PREPEND_LIST') {
    const current = state.get(action.list) || List();
    const newList = action.payload.concat(current);
    return state.set(action.list, newList);
  } else if(action.type === 'APPEND_LIST') {
    const current = state.get(action.list) || List();
    const newList = current.concat(action.payload);
    return state.set(action.list, newList);
  }

  return state;
}

export function posts(state=Map(), action) {
  if(action.type === 'PUT_POST')
    return state.set(action.id, action.post);
  return state;
}
