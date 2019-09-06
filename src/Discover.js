import React, { useState, useEffect, useCallback } from 'react';
import { TextInput, VirtualizedList, View, StyleSheet } from 'react-native';
import { Surface, ActivityIndicator, Appbar, Text, Card } from 'react-native-paper';
import { connect } from 'react-redux';
import { fetchList } from './util';

import { List as ImList, Seq } from 'immutable';

import { ALL_CATEGORIES } from './config';

import { putPost } from './store/actions';

import placeholder from '../assets/placeholder.jpg';

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

const mapS2P = state => {
  const recents = state.history.toIndexedSeq().reverse().slice(0, 5).map(e => state.posts.get(e));

  const keywords = {};
  recents.forEach(e => {
    let tot = 0;
    for(const { score } of e.keywords)
      tot += score;

    for(const { word, score } of e.keywords) {
      if(!keywords[word]) keywords[word] = 0;
      keywords[word] += score / tot;
    }
  });

  console.log(keywords);

  const list = Object.keys(keywords);
  list.sort((a, b) => keywords[b] - keywords[a]);

  console.log(list);

  return {
    keywords: list.slice(0, 10),
    history: state.history,
  };
};

const mapD2P = dispatch => ({
  addPost: p => dispatch(putPost(p.newsID, p)),
});

function Search({ navigation, addPost, keywords, history }) {
  const [refreshing, setRefreshing] = useState(false);
  const [list, setList] = useState(null);

  const refresh = useCallback(async () => {
    setRefreshing(true);

    const datas = await Promise.all(keywords.map(kw => fetchList({ keywords: [kw], limit: 10 })));

    const selected = new Set();
    const filtered = []

    for(const { data: list } of datas)
      for(const row of list)
        if(!history.has(row.newsID) && !selected.has(row.newsID)) {
          filtered.push(row);
          selected.add(row.newsID);
        }

    // Randomly picks 10
    shuffle(filtered);
    setList(ImList(filtered.slice(0, 10)));

    setRefreshing(false);
  }, [refreshing, history]);

  useEffect(() => {
    refresh();
  }, []);

  return <VirtualizedList
    style={styles.list}
    data={list || ImList()}
    getItem={(data, idx) => data.get(idx)}
    getItemCount={data => data.size}
    keyExtractor={(post, idx) => post.newsID}

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
});

export default connect(mapS2P, mapD2P)(Search);
