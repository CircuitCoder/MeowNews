import React, { useState } from 'react';
import { Animated, View, VirtualizedList, StyleSheet } from 'react-native';
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

const OPACITY_THRESHOLD = new Animated.Value(1);
const HEIGHT_THRESHOLD = new Animated.Value(80);
const SHIFT_THRESHOLD = new Animated.Value(80);

function Lists({ categories, navigation, update }) {
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);

  const [progress, setProgress] = useState(new Animated.Value(0));
  const [height, setHeight] = useState(new Animated.Value(0));
  const [movingTarget, setMovingTarget] = useState(null);

  const missing = ImList(ALL_CATEGORIES.filter(e => !categories.includes(e)));

  return <View style={styles.container}>
    <VirtualizedList
      data={categories}
      getItem={(data, idx) => data.get(idx)}
      getItemCount={data => data.size}
      keyExtractor={(data, idx) => data}
      renderItem={({ item, index }) =>
        <Animated.View
          style={{
            opacity: item === movingTarget ? Animated.multiply(progress, OPACITY_THRESHOLD) : OPACITY_THRESHOLD,
            marginLeft: item === movingTarget ? Animated.multiply(Animated.subtract(1, progress), SHIFT_THRESHOLD) : 0,

            height: item === movingTarget ? Animated.multiply(height, HEIGHT_THRESHOLD) : HEIGHT_THRESHOLD,
            overflow: 'hidden',
          }}
        >
          <List.Item
            style={{
              height: 80,
            }}
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
        </Animated.View>
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

                setMovingTarget(item);
                const progress = new Animated.Value(0);
                const height = new Animated.Value(1);
                setProgress(progress);
                setHeight(height);

                Animated.timing(progress, { toValue: 1, duration: 1000 }).start();
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
            setEditing(null);

            setMovingTarget(editing);
            const progress = new Animated.Value(1);
            const height = new Animated.Value(1);
            setProgress(progress);
            setHeight(height);
            Animated.sequence([
              Animated.timing(progress, { toValue: 0, duration: 1000 }),
              Animated.timing(height, { toValue: 0, duration: 1000 }),
            ]).start();

            setTimeout(() => {
              const idx = categories.findIndex(e => e === editing);
              const removed = categories.delete(idx);
              update(removed);
            }, 2000)
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
