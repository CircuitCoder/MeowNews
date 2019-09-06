import React from 'react';

import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import Home from './Home';
import List from './List';

const navigator = createStackNavigator({
  Home,
  List,
}, {
  initialRouteName: 'Home',
  headerMode: 'none',
});

export default createAppContainer(navigator);
