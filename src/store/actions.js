import { List } from 'immutable';
import * as Crypto from 'expo-crypto';

import { fetchList, formatDateTime } from '../util';

export const prependList = (list, payload) => ({
  type: 'PREPEND_LIST',
  list, payload,
});

export const appendList = (list, payload) => ({
  type: 'APPEND_LIST',
  list, payload,
});

export const putPost = (id, post) => ({
  type: 'PUT_POST',
  id, post,
});

export const readPost = id => ({
  type: 'READ_POST',
  id,
});

export const starPost = id => ({
  type: 'STAR_POST',
  id,
});

export const unstarPost = id => ({
  type: 'UNSTAR_POST',
  id,
});

export const reset = () => ({
  type: 'RESET',
});

export function refreshList(category) {
  return async (dispatch, getStore) => {
    const store = getStore();

    const list = store.lists.get(category) || List();

    let from = '1970-01-01 00:00:00';
    if(list.size > 0)
      from = list.get(0).publishTime;

    const payload = await fetchList({
      from,
      category,
    });

    // TODO: loop until last page

    const filtered = await filterContent(dispatch, payload.data, store.posts);
    dispatch(prependList(category, List(filtered)));

    return payload.data.length;
  };
}

export function extendList(category) {
  return async (dispatch, getStore) => {
    const store = getStore();

    const list = store.lists.get(category) || List();

    let till = formatDateTime(new Date());
    if(list.size > 0)
      till = store.posts.get(list.get(list.size-1)).publishTime;

    const payload = await fetchList({
      till,
      category,
    });

    const filtered = await filterContent(dispatch, payload.data, store.posts);
    dispatch(appendList(category, List(filtered)));

    return payload.data.length;
  };
}

function sha256(cont) {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA512,
    cont
  );
}

export async function postHash(post) {
  /*
  const hashee = post.title + post.content;
  return await sha256(hashee);
  */
  return post.newsID;
}

async function filterContent(dispatch, contents, posts) {
  const result = [];
  for(const content of contents) {
    const hash = await postHash(content);
    if(posts.has(hash)) continue;

    dispatch(putPost(hash, content));
    result.push(hash);
  }

  return result;
}
