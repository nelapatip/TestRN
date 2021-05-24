import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack'
import { createCompatNavigatorFactory } from '@react-navigation/compat'
import TabBarIcon from '../screens/TabBarIcon'

import SvgProfile from '../../assets/svgimage/Profile.js';
import SvgProfileSelected from '../../assets/svgimage/ProfileSelected';
import SvgAlerts from '../../assets/svgimage/Alerts.js';
import SvgAlertsSelected from '../../assets/svgimage/AlertsSelected';
import SvgFavorites from '../../assets/svgimage/Favorites.js';
import SvgFavoritesSelected from '../../assets/svgimage/FavoritesSelected';

//actual imports 
import AlertScreen from '../screens/Alerts/AlertScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FavouritesScreen from '../screens/Favourites/FavouritesScreen';
import { COLOR } from '../constants/Colors';
import CreateAlertScreen from '../screens/Alerts/CreateAlertScreen';
import AlertDetailScreen from '../screens/Alerts/AlertDetailScreen';
import DocumentScreen from '../screens/Documents/DocumentScreen';
import DocumentViewScreen from '../screens/Documents/DocumentViewScreen';
import fonts from '../utils/CortellisFonts'
import SearchScreen from './../screens/Alerts/SearchScreen';

import UserPref from '../screens/Interests/UserPreferences'
import LearnMore from '../screens/Interests/LearnMore'


const PreferenceStack = createCompatNavigatorFactory(createStackNavigator)({
  UserPref: UserPref,
  LearnMore: LearnMore
}, {
    defaultNavigationOptions: {
      gesturesEnabled: false
    }
  });

const FavouritesStack = createCompatNavigatorFactory(createStackNavigator)({
  Favourites: FavouritesScreen,
  DocumentScreen: DocumentScreen,
  DocumentViewScreen: DocumentViewScreen

});

FavouritesStack.navigationOptions = ({ navigation }) => {
  let tabBarVisible = true;

  const hideTabBar = navigation.state && navigation.state.routes && navigation.state.routes[0] && navigation.state.routes[0].params ? navigation.state.routes[0].params.hideTabBar : false;
  if (hideTabBar === true) {
    tabBarVisible = false;
  }

  if (navigation.state.routes != undefined && !hideTabBar) {
    let routeName = navigation.state.routes[navigation.state.index].name
    tabBarVisible = routeName == 'DocumentScreen' || routeName == 'DocumentViewScreen' ? false : true
  }

  return {
    tabBarVisible,
    tabBarLabel: 'Favorites',
    tabBarIcon: ({ focused, tintColor }) => <TabBarIcon name="Favorites" focused={focused} color={tintColor} tabBar = {tabBarVisible} icon={<SvgFavorites />} iconSelected={<SvgFavoritesSelected />} />
  }
}

const AlertStack = createCompatNavigatorFactory(createStackNavigator)({
  Alerts: AlertScreen,
  CreateAlert: CreateAlertScreen,
  DocumentScreen: DocumentScreen,
  DocumentViewScreen: DocumentViewScreen,
  AlertDetailScreen: AlertDetailScreen,
  SearchScreen: SearchScreen
});

AlertStack.navigationOptions = ({ navigation }) => {

  let tabBarVisible = true;
  let hideTab = false;

  const hideTabBar = navigation.state && navigation.state.routes && navigation.state.routes[1] && navigation.state.routes[1].params ? navigation.state.routes[1].params.hideTabBar : false;
  if (hideTabBar === true) {
    hideTab = hideTabBar
    tabBarVisible = false;
  }

  const hideTabBar2 = navigation.state && navigation.state.routes && navigation.state.routes[0] && navigation.state.routes[0].params ? navigation.state.routes[0].params.hideTabBar : false;
  if (hideTabBar2 === true) {
    hideTab = hideTabBar2;
    tabBarVisible = false;
  }

  if (navigation.state.routes != undefined && hideTab == false) {
    let routeName = navigation.state.routes[navigation.state.index].name
    tabBarVisible = routeName == 'DocumentScreen' || routeName == 'DocumentViewScreen' || routeName == 'CreateAlert' || routeName == 'SearchScreen' ? false : true
  }

  return {
    tabBarVisible,
    tabBarLabel: 'Alerts',
    tabBarIcon: ({ focused, tintColor }) => <TabBarIcon name="Alerts" color={tintColor} focused={focused} tabBar = {tabBarVisible} icon={<SvgAlerts />} iconSelected={<SvgAlertsSelected />} />

  }
}

const ProfileStack = createCompatNavigatorFactory(createStackNavigator)({
  Profile: ProfileScreen,
  UserPref: UserPref,
  LearnMore: LearnMore
}, {
    defaultNavigationOptions: {
      gesturesEnabled: false
    }
  });

ProfileStack.navigationOptions = ({ navigation }) => {

  let tabBarVisible = true;

  const hideTabBar = navigation.state && navigation.state.routes && navigation.state.routes[1] && navigation.state.routes[1].params ? navigation.state.routes[1].params.hideTabBar : false;
  if (hideTabBar === true) {
    tabBarVisible = false;
  }

  return {
    tabBarVisible,
    tabBarLabel: 'Profile',
    tabBarIcon: ({ focused, tintColor }) => <TabBarIcon name="Profile" color={tintColor} focused={focused} tabBar = {tabBarVisible} icon={<SvgProfile />} iconSelected={<SvgProfileSelected />} />
  }

};

const MainTab = createCompatNavigatorFactory(createBottomTabNavigator)({
  FavouritesStack,
  AlertStack,
  ProfileStack,
},
  {
    activeTintColor: COLOR.THEME_COLOR,
    labeled: false,
    initialRouteName: "AlertStack",
    tabBarOptions: {
      showLabel: false,
      activeTintColor: COLOR.THEME_COLOR,
      tabStyle: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center'
      },
      style: {
        height: 65,
        backgroundColor: COLOR.WHITE

      }, navigationOptions: {
        headerShown: false
      }
    }
  });

export default createCompatNavigatorFactory(createStackNavigator)({
  PreferenceStack: PreferenceStack,
  MainTab: MainTab
}, {
    defaultNavigationOptions: {
      headerShown: false,
      gesturesEnabled: false,
    }
  });