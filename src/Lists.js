import React, { useState } from 'react';
import { VirtualizedList } from 'react-native';
import { FAB, Appbar, BottomNavigation, Text, List } from 'react-native-paper';
import { connect } from 'react-redux';

import { CATEGORY_DESC, CATEGORY_ICON } from './config';

const mapS2P = state => ({
  categories: state.categories,
});

function Lists({ categories, navigation }) {
  return <VirtualizedList
    data={categories}
    getItem={(data, idx) => data.get(idx)}
    getItemCount={data => data.size}
    keyExtractor={(data, idx) => data}
    renderItem={({ item, index }) =>
      <List.Item
        title={item}
        description={CATEGORY_DESC[item]}
        onPress={() => navigation.push('List', {
          category: item,
          type: 'CATEGORY',
        })}
        left={props => <List.Icon {...props} icon={CATEGORY_ICON[item]} />}
      />
    }
  />
}

export default connect(mapS2P)(Lists);
