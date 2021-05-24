import React from 'react';
import { createStackNavigator } from '@react-navigation/stack'
import { createSwitchNavigator } from "@react-navigation/compat";
import { createCompatNavigatorFactory } from '@react-navigation/compat'
import MainTabNavigator from './MainTabNavigator';
import SignInScreen from '../screens/SignInScreen';
import RegisterScreen from '../screens/RegisterScreen';
import WelcomeScreen from '../screens/WelcomeScreen'
import RequestDemo from '../screens/RequestDemo'

const AuthenticationStack = createCompatNavigatorFactory(createStackNavigator)({ Welcome: WelcomeScreen, SignIn: SignInScreen, RequestDemo:RequestDemo});


export const createRootNavigator = (signedIn = false) => {
  return createSwitchNavigator(
    {
      Main: MainTabNavigator,
      Authentication: AuthenticationStack,
    },
    {
      initialRouteName: signedIn ? 'Main' : 'Authentication'
    }
  )
}
