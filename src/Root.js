import React from 'react';

import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import Home from './Home';
import List from './List';
import Post from './Post';
import Search from './Search';

const navigator = createStackNavigator({
  Home,
  List,
  Post,
  Search,
}, {
  initialRouteName: 'Home',
  headerMode: 'none',
});

export default createAppContainer(navigator);
