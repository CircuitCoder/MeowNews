import React, { useState, useEffect, useCallback } from 'react';
import { TextInput, VirtualizedList, Image, View, StyleSheet } from 'react-native';
import { Surface, ActivityIndicator, Appbar, Text, Card } from 'react-native-paper';
import { connect } from 'react-redux';
import { fetchList } from './util';

import { List as ImList, Seq } from 'immutable';

import { ALL_CATEGORIES } from './config';

import { putPost } from './store/actions';

import placeholder from '../assets/placeholder.jpg';
import notfound from '../assets/notfound.png';

const mapD2P = dispatch => ({
  addPost: p => dispatch(putPost(p.newsID, p)),
});

function Search({ navigation, addPost }) {
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [onEnd, setOnEnd] = useState(false);
  const [debouncer, setDebouncer] = useState(null);
  const [list, setList] = useState(ImList());

  const refresh = useCallback(async () => {
    if(refreshing) return;

    if(debouncer !== null || search === '') return setList(ImList());

    setRefreshing(true);

    const list = await fetchList({ keywords: search.split(' ') });
    setList(ImList(list.data));

    setRefreshing(false);
  }, [refreshing, search, debouncer]);

  const fetchMore = useCallback(async () => {
    if(fetching || onEnd) return;
    setFetching(true);

    const fetched = await fetchList({ keywords: search.split(' '), till: list.get(list.size-1).publishTime });
    let concated = list;
    for(const row of fetched.data)
      if(!concated.find(e => e.newsID === row.newsID))
        concated = concated.push(row);

    setList(ImList(concated));

    if(concated.size === list.size) setOnEnd(true);
    setFetching(false);
  }, [fetching, onEnd, list]);

  useEffect(() => {
    refresh();
  }, [debouncer, search]);

  return <View style={styles.container}>
    <Surface elevation={8}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction
          onPress={() => navigation.goBack()}
        />

        <TextInput
          style={styles.input}
          placeholder="Type here..."
          placeholderTextColor="rgba(255,255,255,.38)"
          onChangeText={text => {
            setSearch(text);

            if(debouncer !== null) clearTimeout(debouncer);
            setDebouncer(setTimeout(() => {
              setDebouncer(null);
            }, 500));
          }}
          value={search}
        />
      </Appbar.Header>
    </Surface>

    <VirtualizedList
      style={styles.list}
      data={list || ImList()}
      getItem={(data, idx) => data.get(idx)}
      getItemCount={data => data.size}
      keyExtractor={(post, idx) => post.newsID}

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

      renderItem={({ item: post, index }) => {
        return <Card
          style={styles.card}
          elevation={2}
          onPress={() => {
            addPost(post);
            navigation.push('Post', { id: post.newsID })
          }}
          onLongPress={() => console.log(post)}
        >
          <Card.Cover
            style={styles.img}
            source={ post.images.length > 0 ? { uri: post.images[0] } : placeholder }
          />

          <View style={styles.cardInner}>
            <Text style={styles.title}>
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

    { list.size === 0 && search && !refreshing && debouncer === null ? <View style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
    }}>
      <Image
        source={notfound}
        resizeMode="contain"
        style={{
          height: 120,
        }}
      />
      <Text style={{
        marginTop: 10,
        color: 'rgba(0,0,0,.38)',
        fontSize: 16,
      }}>Nothing to see here</Text>
    </View> : null }
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

  input: {
    flex: 1,
    color: 'white',
    fontSize: 16,
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

export default connect(null, mapD2P)(Search);
