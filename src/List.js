import React, { useState, useEffect, useCallback } from 'react';
import { VirtualizedList, View, StyleSheet } from 'react-native';
import { Surface, ActivityIndicator, Appbar, Text, Card } from 'react-native-paper';
import { connect } from 'react-redux';

import { List as ImList, Seq } from 'immutable';

import { ALL_CATEGORIES } from './config';

import { refreshList, extendList } from './store/actions';

import placeholder from '../assets/placeholder.jpg';

const mapS2P = (state, { navigation }) => {
  const type = navigation.getParam('type', 'CATEGORY');

  if(type === 'CATEGORY') {
    const category = navigation.getParam('category', ALL_CATEGORIES[0]);
    return {
      list: Seq(state.lists.get(category)).map(e => ({
        read: state.history.has(e),
        post: state.posts.get(e),
      })),
      type,
      category,
    };
  } else if(type === 'HISTORY') {
    return {
      list: state.history.toIndexedSeq().reverse().map(e => ({
        read: false,
        post: state.posts.get(e),
      })),
      type,
    };
  } else return {
    list: Seq(),
    type: 'UNKNOWN',
  };
};

const mapD2P = (dispatch, { navigation }) => {
  const type = navigation.getParam('type', 'CATEGORY');

  if(type === 'CATEGORY') {
    const category = navigation.getParam('category', ALL_CATEGORIES[0]);
    return {
      refresh: () => dispatch(refreshList(category)),
      extend: () => dispatch(extendList(category)),
    };
  } else return {
    refresh: () => {},
    extend: () => {},
  };
};

function List({ navigation, type, category, list, refresh: doRefresh, extend }) {

  console.log(list);

  const [fetching, setFetching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [onEnd, setOnEnd] = useState(false);

  const refresh = useCallback(async () => {
    if(refreshing) return;
    setRefreshing(true);
    await doRefresh();
    setRefreshing(false);
  }, [refreshing]);

  // Refresh list immediately if no list is ready
  useEffect(() => {
    if(list.size === 0)
      refresh();
  }, []);

  const fetchMore = useCallback(async () => {
    console.log('Extend');
    if(fetching || onEnd) return;
    setFetching(true);
    const length = await extend();

    if(length === 0) setOnEnd(true);
    setFetching(false);
  }, [fetching, onEnd]);

  let header = null;

  if(type === 'CATEGORY') {
    header = <Appbar.Content
      title="News List"
      subtitle={'Category: ' + category}
    />
  } else if(type === 'HISTORY') {
    header = <Appbar.Content
      title="History"
    />
  }

  return <View style={styles.container}>
    <Surface elevation={8}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction
          onPress={() => navigation.goBack()}
        />
        { header }
      </Appbar.Header>
    </Surface>

    <VirtualizedList
      style={styles.list}
      data={list || ImList()}
      getItem={(data, idx) => data.get(idx)}
      getItemCount={data => data.size}
      keyExtractor={({ post }, idx) => post.newsID}

      ListFooterComponent={() => <View style={{
        ...styles.loading,
        opacity: fetching ? 1 : 0,
      }}>
        <ActivityIndicator animating={true} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>}

      onEndReachedThreshold={0.1}
      onEndReached={fetchMore}

      onRefresh={refresh}
      refreshing={refreshing}

      renderItem={({ item: { read, post }, index }) => {
        return <Card
          style={styles.card}
          elevation={2}
          onPress={() => navigation.push('Post', { id: post.newsID })}
          onLongPress={() => console.log(post)}
        >
          <Card.Cover
            style={styles.img}
            source={ post.images.length > 0 ? { uri: post.images[0] } : placeholder }
          />

          <View style={styles.cardInner}>
            <Text style={{
              ...styles.title,
              color: read ? 'rgba(0,0,0,.38)' : 'rgba(0,0,0,.87)',
            }}>
              { post.title }
            </Text>

            <View style={styles.info}>
              <Text style={styles.time}>{ post.publishTime }</Text>
              <Text style={styles.publisher}>{ post.publisher }</Text>
            </View>
          </View>
        </Card>;
      }}
    />
  </View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  appbar: {
    zIndex: 1000,
  },

  card: {
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 20,
    marginRight: 20,
  },

  list: {
    paddingTop: 10,
  },

  title: {
    fontSize: 22,
    lineHeight: 26,
    padding: 20,
    fontWeight: 'bold',

    color: 'rgba(0,0,0,.87)',

    flex: 1,
  },

  info: {
    flexDirection: 'row',
    display: 'flex',

    fontSize: 14,
    lineHeight: 20,
    fontWeight: 'bold',

    padding: 20,
    paddingBottom: 10,
  },

  time: {
    flex: 1,
    color: 'rgba(0,0,0,.7)',
  },

  publisher: {
    color: 'rgba(0,0,0,.7)',
  },

  img: {
    height: 180,
  },

  cardInner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

    backgroundColor: 'rgba(255,255,255,.6)',

    flexDirection: 'column',
    display: 'flex',
  },

  loading: {
    height: 60,
    paddingBottom: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  loadingText: {
    fontSize: 14,
    color: 'rgba(0,0,0,.38)',
    lineHeight: 40,
    textAlign: 'center',
    marginLeft: 10,
  },
});

export default connect(mapS2P, mapD2P)(List);
