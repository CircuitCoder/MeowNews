import React, { useState, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';

import * as Wechat from 'react-native-wechat';
import RichShare from 'react-native-share';

import { ToastAndroid, Share, Image, View, ScrollView, StyleSheet } from 'react-native';
import { Divider, Portal, Dialog, ActivityIndicator, Appbar, Text, Button, List } from 'react-native-paper';

import AES from 'aes-js';
import { Buffer } from 'buffer';

import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system'
import * as Random from 'expo-random';
import * as Crypto from 'expo-crypto';

import { readPost, starPost, unstarPost, inboxArc } from './store/actions';

import placeholder from '../assets/placeholder.jpg';

const mapS2P = (state, { navigation }) => {
  const id = navigation.getParam('id', null);
  return {
    post: state.posts.get(id),
    starred: state.favorites.has(id),
    inInbox: state.inbox.has(id),
  };
};

const mapD2P = (dispatch, { navigation }) => {
  const id = navigation.getParam('id', null);
  return {
    read: () => dispatch(readPost(id)),
    star: () => dispatch(starPost(id)),
    unstar: () => dispatch(unstarPost(id)),
    arc: () => dispatch(inboxArc(id)),
  };
};

const THRESHOLD = 154;

function Post({ navigation, post, read, star, unstar, starred, inInbox, arc }) {
  useEffect(() => {
    read();
  }, []);

  const [appbar, setAppbar] = useState(0);
  const [encSharing, setEncSharing] = useState(false);
  const [advancedSharing, setAdvancedSharing] = useState(false);

  const checkLocation = useCallback(payload => {
    const y = payload.nativeEvent.contentOffset.y;
    if(y >= THRESHOLD) setAppbar(1);
    else setAppbar(y / THRESHOLD);
  }, []);

  const share = useCallback(async () => {
    /*
    const result = await Share.share({
      title: `Read on PaperDye: ${post.title}`,
      message: `Shared from PaperDye: ${post.title}\n\n${post.content.substr(0, 10)}...`,
      url: 'https://google.com',
    }, {
      dialogTitle: 'Test share',
    });

    if(result.action === Share.sharedAction)
      ToastAndroid.show('Shared!', ToastAndroid.SHORT);
    */

    const message = post.title + '\n\n' + post.content.substr(0, 80) + '...';
    const opts = { message };

    if(post.images.length > 0) {
      // Fetching data
      const segs = post.images[0].split('.');
      const ext = segs[segs.length-1];
      const { uri, status, headers } = await FileSystem.downloadAsync(post.images[0], FileSystem.cacheDirectory + 'tmp.' + ext);
      const type = headers['Content-Type'];
      const dataUri = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      opts.url = `data:${type};base64,${dataUri}`;
    }

    /*
    const result = await IntentLauncher.startActivityAsync('android.intent.action.SEND', {
      type,
      extra: {
        'android.intent.extra.TEXT': `${post.title}\n\n${post.content.substr(0,40)}...`,
        'android.intent.extra.STREAM': contentUri,
      },
      data: contentUri,
      flags: 1,
    });
    */

    // const result = await Sharing.shareAsync(uri);

    const result = await RichShare.open(opts);
  }, [post]);

  async function getWechatMetadata() {
    const digest = post.content.substr(0, 80) + '...';
    if(post.images.length > 0) {
      const segs = post.images[0].split('.');
      const ext = segs[segs.length-1];
      const { uri, status, headers } = await FileSystem.downloadAsync(post.images[0], FileSystem.cacheDirectory + 'tmp.' + ext);
      return {
        type: 'imageFile',
        imageUrl: uri,
      };
    } else {
      return {
        description: `I'm reading: ${post.title}\n\n${digest}`,
        type: 'text',
      };
    }
  }

  const wechatShare = useCallback(async () => {
    setAdvancedSharing(false);
    const metadata = await getWechatMetadata();
    const resp = await Wechat.shareToSession(metadata);
    console.log(resp);
  });

  const wechatTLShare = useCallback(async () => {
    setAdvancedSharing(false);
    const metadata = await getWechatMetadata();
    const resp = await Wechat.shareToTimeline({
      type: 'text',
      description: '???',
    });
    console.log(resp);
  });

  const encShare = useCallback(async () => {
    setAdvancedSharing(false);
    setEncSharing(true);

    const plain = JSON.stringify(post);
    const key = await Random.getRandomBytesAsync(256/8);
    const ctr = new AES.ModeOfOperation.ctr(key);
    const encrypted = AES.utils.hex.fromBytes(ctr.encrypt(AES.utils.utf8.toBytes(plain)));

    const resp = await fetch('https://transfer.sh/dye', {
      method: 'PUT',
      headers: {
        'Content-Type': 'text/plain',
        'Max-Downloads': 1,
        'Max-Days': 1,
      },
      mode: 'cors',
      body: encrypted,
    });
    const url = await resp.text();
    const [,seg] = url.match(/^https:\/\/transfer\.sh\/([^/]+)\/dye$/);
    const ident = `${seg}/${AES.utils.hex.fromBytes(key)}`;

    setEncSharing(false);

    setTimeout(async () => {
      const result = await Share.share({
        message: ident,
      }, {
        dialogTitle: 'Save/Send your share-code',
      });

      ToastAndroid.show('Copy the share-code into MeowNews Inbox', ToastAndroid.SHORT);
    }, 200);
  });

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
        color={ starred ? '#ffc107' : 'white' }
        onPress={starred ? unstar : star}
      />

      <Appbar.Action
        icon="share"
        onPress={ share }
        onLongPress={ () => setAdvancedSharing(true) }
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

      { inInbox ? <View style={styles.bottomBtns}>
        <Button icon="done" style={styles.bottomBtn} onPress={() => {
          arc();
          navigation.goBack();
        }}>Archive from Inbox</Button>
        <Button icon="star" style={styles.bottomBtn} onPress={() => {
          arc();
          star();
          navigation.goBack();
        }}>Star & archive</Button>
      </View> : null}
    </ScrollView>

    <Portal>
      <Dialog
        visible={advancedSharing}
        onDismiss={() => setAdvancedSharing(false)}
      >
        <List.Item
          title="Generate encrypted single-use token"
          left={props => <List.Icon {...props} icon="lock" />}
          onPress={encShare}
        />
        <List.Item
          title="Share to WeChat"
          left={props => <List.Icon {...props} icon="question-answer" />}
          onPress={wechatShare}
        />
        <List.Item
          title="Share to WeChat Timeline"
          left={props => <List.Icon {...props} icon="camera" />}
          onPress={wechatTLShare}
        />
      </Dialog>
    </Portal>

    <Portal>
      <Dialog
        visible={encSharing}
        onDismiss={() => setEncSharing(false)}
      >
        <Dialog.Title>Generating, calculating and sending some bytes</Dialog.Title>
        <Dialog.Content>
          <ActivityIndicator size="large" />
        </Dialog.Content>
      </Dialog>
    </Portal>
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

  bottomBtns: {
    display: 'flex',
    alignItems: 'center',
  },

  bottomBtn: {
    marginBottom: 20,
  },
});

export default connect(mapS2P, mapD2P)(Post);
