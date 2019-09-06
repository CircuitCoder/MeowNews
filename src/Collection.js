import React, { useState } from 'react';
import { Portal, Dialog, Text, List, Button, Paragraph } from 'react-native-paper';
import { ToastAndroid, View } from 'react-native';

import { connect } from 'react-redux';

import { reset } from './store/actions';

const mapD2P = dispatch => {
  return {
    resetStore: () => dispatch(reset()),
  };
};

function Collection({ navigation, resetStore }) {
  const [reseting, setReseting] = useState(false);

  return <View>
    <List.Item
      title="History"
      onPress={() => {
        navigation.push('List', {
          type: 'HISTORY',
        });
      }}
      left={props => <List.Icon {...props} icon="history" />}
    />

    <List.Item
      title="Drop local storage"
      description="Delete all local data, including your preferences"
      onPress={() => setReseting(true)}
      left={props => <List.Icon {...props} icon="delete" />}
    />

    <Portal>
      <Dialog
        visible={reseting}
        onDismiss={() => setReseting(false)}
      >
        <Dialog.Title>We are goting to delete everything!</Dialog.Title>
        <Dialog.Content>
          <Paragraph>
            This includes all your preferences, favorites, offline lists, offline articles and your viewing history.
          </Paragraph>
          <Paragraph>
            You can download saved contents again, as long as they are not deleted yet.
          </Paragraph>

          <Paragraph>
            Are you sure?
          </Paragraph>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setReseting(false)}>Cancel</Button>
          <Button onPress={() => {
            resetStore();
            ToastAndroid.show('All saved data has been wiped.', ToastAndroid.SHORT);
            setReseting(false)
          }}>DO IT</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  </View>;
}

export default connect(null, mapD2P)(Collection);
