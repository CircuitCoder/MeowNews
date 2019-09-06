import React, { useState, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';

import { Image, View, ScrollView, StyleSheet } from 'react-native';
import { Appbar, Text } from 'react-native-paper';

import { readPost, starPost, unstarPost } from './store/actions';

import placeholder from '../assets/placeholder.jpg';

const mapS2P = (state, { navigation }) => {
  const id = navigation.getParam('id', null);
  return {
    post: state.posts.get(id),
    starred: state.favorites.has(id),
  };
};

const mapD2P = (dispatch, { navigation }) => {
  const id = navigation.getParam('id', null);
  return {
    read: () => dispatch(readPost(id)),
    star: () => dispatch(starPost(id)),
    unstar: () => dispatch(unstarPost(id)),
  };
};

const THRESHOLD = 154;

function Post({ navigation, post, read, star, unstar, starred }) {
  useEffect(() => {
    read();
  }, []);
  const [appbar, setAppbar] = useState(0);
  const checkLocation = useCallback(payload => {
    const y = payload.nativeEvent.contentOffset.y;
    if(y >= THRESHOLD) setAppbar(1);
    else setAppbar(y / THRESHOLD);
  }, []);

  return <View style={styles.container}>
    <Appbar.Header style={{
      ...styles.appbar,
      backgroundColor: `rgba(0,0,0,${0.3 * appbar})`,
    }}>
      <Appbar.BackAction
        onPress={() => navigation.goBack()}
      />

      <Appbar.Content
        title={post.title}
        subtitle={post.publisher}

        titleStyle={{
          color: `rgba(255,255,255,${appbar})`,
        }}
        subtitleStyle={{
          color: `rgba(255,255,255,${appbar})`,
        }}
      />

      <Appbar.Action
        icon={ starred ? 'star' : 'star-border' }
        onPress={starred ? unstar : star}
      />
    </Appbar.Header>

    <ScrollView onScroll={checkLocation} style={styles.scroll}>
      <Image
        style={styles.headerImg}
        source={ post.images.length > 0 ? { uri: post.images[0] } : placeholder }
      />

      <View style={styles.main}>
        <Text style={styles.title}>
          { post.title }
        </Text>

        <Text style={styles.info}>
          { post.category } / { post.publisher } / { post.publishTime }
        </Text>

        { post.content.replace('\n\n+', '\n').split('\n').map((e, idx) => <Text key={idx} style={styles.para}>{ e }</Text>) }
      </View>
    </ScrollView>
  </View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  appbar: {
    zIndex: 100,
  },

  headerImg: {
    height: 240,
  },

  title: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: 'bold',

    color: 'rgba(0,0,0,.87)',

    marginBottom: 10,
  },

  info: {
    color: 'rgba(0,0,0,.54)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 30,
  },

  para: {
    marginBottom: 20,
    fontSize: 14,
    lineHeight: 22,
  },

  main: {
    padding: 20,
  },

  scroll: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    flex: 1,
  },
});

export default connect(mapS2P, mapD2P)(Post);
