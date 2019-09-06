import { List, Map, OrderedSet } from 'immutable';

import { ALL_CATEGORIES } from '../config';

export function categories(state=List(ALL_CATEGORIES), action) {
  if(action.type === 'RESET')
    return List(ALL_CATEGORIES);
  if(action.type === 'SET_CATEGORIES')
    return action.categories;
  return state;
}

export function lists(state=Map(), action) {
  if(action.type === 'RESET')
    return Map();
  if(action.type === 'PREPEND_LIST') {
    const current = state.get(action.list) || List();
    const newList = action.payload.concat(current);
    return state.set(action.list, newList);
  }
  if(action.type === 'APPEND_LIST') {
    const current = state.get(action.list) || List();
    const newList = current.concat(action.payload);
    return state.set(action.list, newList);
  }

  return state;
}

export function posts(state=Map(), action) {
  if(action.type === 'RESET')
    return Map();
  if(action.type === 'PUT_POST')
    return state.set(action.id, action.post);
  return state;
}

export function history(state=OrderedSet(), action) {
  if(action.type === 'RESET')
    return OrderedSet();
  if(action.type === 'READ_POST') {
    const removed = state.remove(action.id); // Propagate to front
    return removed.add(action.id);
  }
  return state;
}

export function favorites(state=OrderedSet(), action) {
  if(action.type === 'RESET')
    return OrderedSet();
  if(action.type === 'STAR_POST') {
    const removed = state.remove(action.id); // Propagate to front
    return removed.add(action.id);
  }
  if(action.type === 'UNSTAR_POST')
    return state.remove(action.id);

  return state;
}
