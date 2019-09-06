import React, { useState } from 'react';
import { View, VirtualizedList, StyleSheet } from 'react-native';
import { Portal, Dialog, Text, List, Button, Paragraph, FAB } from 'react-native-paper';
import { connect } from 'react-redux';

import { Seq, List as ImList } from 'immutable';

import { CATEGORY_DESC, CATEGORY_ICON, ALL_CATEGORIES } from './config';

import { setCategories } from './store/actions';

const mapS2P = state => ({
  categories: state.categories,
});

const mapD2P = dispatch => ({
  update: cate => dispatch(setCategories(cate)),
});

function Lists({ categories, navigation, update }) {
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);

  const missing = ImList(ALL_CATEGORIES.filter(e => !categories.includes(e)));

  return <View style={styles.container}>
    <VirtualizedList
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
          onLongPress={() => {
            setEditing(item);
          }}
          left={props => <List.Icon {...props} icon={CATEGORY_ICON[item]} />}
        />
      }
    />
    <FAB
      style={styles.fab}
      visible={missing.size > 0}
      onPress={() => setAdding(true)}
      icon="add"
    />
    <Portal>
      <Dialog
        visible={adding}
        onDismiss={() => setAdding(false)}
      >
        <VirtualizedList
          data={missing}
          getItem={(data, idx) => data.get(idx)}
          getItemCount={data => data.size}
          keyExtractor={(data, idx) => data}
          renderItem={({ item, index }) =>
            <List.Item
              title={item}
              description={CATEGORY_DESC[item]}
              onPress={() => {
                update(categories.push(item));
                setAdding(false);
              }}
              left={props => <List.Icon {...props} icon={CATEGORY_ICON[item]} />}
            />
          }
        />
      </Dialog>
    </Portal>
    <Portal>
      <Dialog
        visible={editing !== null}
        onDismiss={() => setEditing(null)}
      >
        <List.Item
          title="Delete"
          left={props => <List.Icon {...props} icon="delete" />}
          onPress={() => {
            const idx = categories.findIndex(e => e === editing);
            const removed = categories.delete(idx);
            update(removed);
            setEditing(null);
          }}
        />

        <List.Item
          title="Raise to top"
          left={props => <List.Icon {...props} icon="vertical-align-top" />}
          onPress={() => {
            const idx = categories.findIndex(e => e === editing);
            const removed = categories.delete(idx);
            const pushed = removed.unshift(editing);
            update(pushed);
            setEditing(null);
          }}
        />
      </Dialog>
    </Portal>
  </View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
});

export default connect(mapS2P, mapD2P)(Lists);
