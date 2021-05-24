import './src/utils/global'
import React from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import App from './App';
import { Provider, connect } from 'react-redux';


import { store } from './src/store/configureStore';


import { isSignedIn } from "./src/actions/LoginActions";
import SplashScreen from './src/screens/SplashScreen';

export default class Setup extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <Provider store={store}>
               <App/>
            </Provider>
        );
    }

}