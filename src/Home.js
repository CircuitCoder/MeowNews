import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, FAB, Appbar, BottomNavigation, Text } from 'react-native-paper';

import Lists from './Lists';
import Discover from './Discover';
import Collection from './Collection';

const bottomRoutes = [
  { key: 'discover', title: 'Discover', icon: 'style' },
  { key: 'lists', title: 'Lists', icon: 'list' },
  { key: 'collection', title: 'Collection', icon: 'person' },
];

const sceneMap = {
  lists: Lists,
  discover: Discover,
  collection: Collection,
};

export default function Root({ navigation }) {
  const [idx, setIdx] = useState(1);

  const bottomState = {
    index: idx,
    routes: bottomRoutes,
  };

  const renderScene = ({ route, jumpTo }) => {
    const Comp = sceneMap[route.key];
    return <Comp jumpTo={jumpTo} navigation={navigation} />
  };

  return <View style={styles.container}>
    <Surface elevation={8}>
      <Appbar.Header>
        <Appbar.Content
          title="MeowNews"
        />

        <Appbar.Action
          icon="search"
          onPress={() => navigation.push('Search')}
        />
      </Appbar.Header>
    </Surface>

    <BottomNavigation
      navigationState={bottomState}
      onIndexChange={setIdx}
      renderScene={renderScene}
      shifting={true}
    />
  </View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
