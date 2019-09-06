import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { FAB, Appbar, BottomNavigation, Text } from 'react-native-paper';

import Lists from './Lists';
import Discover from './Discover';
import Collection from './Collection';

const bottomRoutes = [
  { key: 'lists', title: 'Lists', icon: 'list' },
  { key: 'discover', title: 'Discover', icon: 'star' },
  { key: 'collection', title: 'Collection', icon: 'person' },
];

const sceneMap = {
  lists: Lists,
  discover: Discover,
  collection: Collection,
};

export default function Root({ navigation }) {
  const [idx, setIdx] = useState(0);

  const bottomState = {
    index: idx,
    routes: bottomRoutes,
  };

  const renderScene = ({ route, jumpTo }) => {
    const Comp = sceneMap[route.key];
    return <Comp jumpTo={jumpTo} navigation={navigation} />
  };

  return <View style={styles.container}>
    <Appbar.Header>
      <Appbar.Content
        title="PaperDye"
      />
    </Appbar.Header>

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
