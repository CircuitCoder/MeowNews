import React from 'react';

import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import Home from './Home';
import List from './List';
import Post from './Post';

const navigator = createStackNavigator({
  Home,
  List,
  Post,
}, {
  initialRouteName: 'Home',
  headerMode: 'none',
});

export default createAppContainer(navigator);
