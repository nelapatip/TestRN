import './src/utils/global'
import React from 'react';
import { Platform, StatusBar, StyleSheet, View,Alert, AppState } from 'react-native';
import { createRootNavigator } from './src/navigation/AppNavigator';
import { NavigationContainer } from '@react-navigation/native';
import { createSwitchNavigator } from "@react-navigation/compat";
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import  AsyncStorage  from "@react-native-community/async-storage";
import { Provider, connect } from 'react-redux';
import firebase from 'react-native-firebase'
import { CONSTANTS } from './src/constants/Constants'
import NavigationService from './src/utils/NavigationService';
import UpdateIos from './src/utils/UpdateChecker'


//initialize db
import { Database } from './src/utils/DatabaseHelper'

// import actions
import { connectionState } from "./src/actions/OfflineActions";
import NetInfo from "@react-native-community/netinfo";
let Analytics = firebase.analytics();

import { isSignedIn } from "./src/actions/LoginActions";
import SplashScreen from './src/screens/SplashScreen';

let backgroundNotification;
class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      signedIn: false,
      checkedSignIn: false,
      deviceToken: '',
      isFromNotification: false,
      isTokenUpdateRequired: undefined,
      notificationRouteScreen: null,
      uuid: null,
      isFavourite: null
    };

    Database.openDB().then((DB) => {
      console.log(`promise returned ${DB}`)
      //Database.closeDatabase()
    })

    // let backgroundNotification;
  }




  componentDidMount() {

    AppState.addEventListener('change', this._handleAppStateChange);

    if (Platform.OS == 'android') {
      this.checkPermission();
      this.createNotificationListeners()
    }
    else {
      this.handlePushNotificationIOS()
      UpdateIos.promptUser()
    }

    isSignedIn()
      .then(res => this.setState({ signedIn: res, checkedSignIn: true }))
      .catch(err => alert("An error occurred"));

      NetInfo.isConnected.addEventListener('connectionChange', this._handleConnectionChange);
    }

  _handleAppStateChange = (nextAppState) => {

    if (nextAppState === 'active' && backgroundNotification != null) {
      this.appOpenedByNotificationTap(backgroundNotification);
      backgroundNotification = null;
    }
  }


  appOpenedByNotificationTap(notification) {
    Analytics.logEvent(CONSTANTS.FIREBASE_ANALYTICS.NOTIFICATION_CLICKED, { "platform": Platform.OS ,"userId":global.userID})
    // This is your handler. The tapped notification gets passed in here.
    // Do whatever you like with it.
   // console.log("Notification = " + notification);
    this.setState({isFromNotification:true},()=>{
      const alertObj = notification.getAlert()
      const { messageId, isFavourite } = alertObj;
      if(isFavourite){
        NavigationService.navigate("Favourites",{uuid: messageId , isComingFromNotification: true , 
          onGoBack: (callback) => callback(),
        })
      }else{
        NavigationService.navigate("AlertDetailScreen",{uuid: messageId , isComingFromNotification: true , 
          onGoBack: (callback) => callback(),
        })
      }
    })
  }

  handlePushNotificationIOS() {
    PushNotificationIOS.addEventListener('register', token => {
      console.log("APNS Device Token ::" + token)
      AsyncStorage.getItem('DeviceToken', (err, result) => {
        if (result == null) {
          this.setState({
            deviceToken: token,
            isTokenUpdateRequired: true
          }, () => {
            AsyncStorage.setItem('DeviceToken', this.state.deviceToken)
            AsyncStorage.setItem('isTokenUpdate', JSON.stringify(this.state.isTokenUpdateRequired))
          })
        }
        else {
          AsyncStorage.getItem('isTokenUpdate', (err, isTokenResult) => {
            if (isTokenResult == null) {
              this.setState({
                isTokenUpdateRequired: true
              }, () => {
                AsyncStorage.setItem('isTokenUpdate', JSON.stringify(this.state.isTokenUpdateRequired))
              })
            }
            else {
              if (JSON.parse(isTokenResult)) {
                this.setState({
                  isTokenUpdateRequired: true
                }, () => {
                  AsyncStorage.setItem('isTokenUpdate', JSON.stringify(this.state.isTokenUpdateRequired))

                })
              }
              else {
                this.setState({
                  isTokenUpdateRequired: false
                }, () => {
                  AsyncStorage.setItem('isTokenUpdate', JSON.stringify(this.state.isTokenUpdateRequired))

                })
              }
            }
          })
          if (token != result) {
            this.setState({
              deviceToken: token,
              isTokenUpdateRequired: true
            }, () => {
              AsyncStorage.setItem('isTokenUpdate', JSON.stringify(this.state.isTokenUpdateRequired))
              AsyncStorage.setItem('DeviceToken', this.state.deviceToken)
            })

          }
        }
      })


    })

    PushNotificationIOS.addEventListener('registrationError', registrationError => {
      console.log(registrationError, '--')
    })

    PushNotificationIOS.addEventListener('localNotification', localNotification => {
    })



    PushNotificationIOS.addEventListener('notification', function (notification) {
      if (!notification) {
        return
      }

      if (AppState.currentState === 'background') {
        Analytics.logEvent(CONSTANTS.FIREBASE_ANALYTICS.NOTIFICATION_CLICKED, { "platform": Platform.OS ,"userId":global.userID})
        backgroundNotification = notification;
      }
      else{
        const alert = notification.getAlert()
        // const data = notification.getData()
        const { title, body } = alert;
        // this.showAlert(title, body);
  
        Alert.alert(
          title, body,
          [
            { text: 'OK', onPress: () => console.log('OK Pressed') },
          ],
          { cancelable: false },
        );
  
      }

      

    })




    //When app is in killed state
    PushNotificationIOS.getInitialNotification().then(notification => {
      if (!notification) {
        return
      }

      if (notification != null) {
        appOpenedByNotificationTap(notification);
      }
    })
    
    PushNotificationIOS.requestPermissions()

    PushNotificationIOS.setApplicationIconBadgeNumber(0)
  }





  _handleConnectionChange = (isConnected) => {
    this.props.dispatch(connectionState({ status: isConnected }));
  };


  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
    NetInfo.isConnected.removeEventListener('connectionChange', this._handleConnectionChange);
    this.notificationListener();
    this.notificationOpenedListener();
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.isConnected !== nextProps.isConnected) {
      return false;
    }
    return true;
  }

 async createNotificationListeners() {
    /*
    * Triggered when a particular notification has been received in foreground
    * */
    this.notificationListener = firebase.notifications().onNotification((notification) => {
      const { title, body } = notification;
      this.showAlert(title, body);
    });

    /*
    * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
    * */

    this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {

      Analytics.logEvent(CONSTANTS.FIREBASE_ANALYTICS.NOTIFICATION_CLICKED, { "platform": Platform.OS ,"userId":global.userID})
      const { title, body } = notificationOpen.notification.data;
  
      this.setState({isFromNotification:true},()=>{
      const alertObj = notificationOpen.notification.data;
      const { messageId, isFavourite } = alertObj;
      if(isFavourite === "true"){
        this.setState({notificationRouteScreen: "Favourites" , uuid: messageId , isFavourite:true})
      }else{
        this.setState({notificationRouteScreen: "Favourites" , uuid: messageId, isFavourite: false})  
      }    
    
    })
    });

    /*
    * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
    * */
    const notificationOpen = await firebase.notifications().getInitialNotification();
    if (notificationOpen) {
      Analytics.logEvent(CONSTANTS.FIREBASE_ANALYTICS.NOTIFICATION_CLICKED, { "platform": Platform.OS ,"userId":global.userID})
      const { title, body } = notificationOpen.notification.data;
  
      this.setState({isFromNotification:true},()=>{
      const alertObj = notificationOpen.notification.data;
      const { messageId, isFavourite } = alertObj;
      if(isFavourite === "true"){
        this.setState({notificationRouteScreen: "Favourites" , uuid: messageId , isFavourite:true})
      }else{
        this.setState({notificationRouteScreen: "Favourites" , uuid: messageId, isFavourite: false})  
      }    
      
    })

    }

    /*
    * Triggered for data only payload in foreground
    * */
    this.messageListener = firebase.messaging().onMessage((message) => {
      //process data message
      console.log(JSON.stringify(message));
    });
  }

  showAlert(title, body) {
    Alert.alert(
      title, body,
      [
        { text: 'OK', onPress: () => console.log('OK Pressed') },
      ],
      { cancelable: false },
    );
  }



  async checkPermission() {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      this.getFCMToken();
    } else {
      this.requestPermission();
    }
  }

  async getFCMToken() {
    fcmToken = await firebase.messaging().getToken();
    console.log("FCM Token : " + fcmToken)

    AsyncStorage.getItem('DeviceToken', (err, result) => {
      if (result == null) {
        this.setState({
          deviceToken: fcmToken,
          isTokenUpdateRequired: true
        }, () => {
          AsyncStorage.setItem('DeviceToken', this.state.deviceToken)
          AsyncStorage.setItem('isTokenUpdate', JSON.stringify(this.state.isTokenUpdateRequired))
        })
      }

      else {
        AsyncStorage.getItem('isTokenUpdate', (err, isTokenResult) => {
          if (isTokenResult == null) {
            this.setState({
              isTokenUpdateRequired: true
            }, () => {
              AsyncStorage.setItem('isTokenUpdate', JSON.stringify(this.state.isTokenUpdateRequired))
            })
          }
          else {
            if (JSON.parse(isTokenResult)) {
              this.setState({
                isTokenUpdateRequired: true
              }, () => {
                AsyncStorage.setItem('isTokenUpdate', JSON.stringify(this.state.isTokenUpdateRequired))

              })
            }
            else {
              this.setState({
                isTokenUpdateRequired: false
              }, () => {
                AsyncStorage.setItem('isTokenUpdate', JSON.stringify(this.state.isTokenUpdateRequired))

              })
            }
          }
        })
        if (fcmToken != result) {
          this.setState({
            deviceToken: fcmToken,
            isTokenUpdateRequired: true
          }, () => {
            AsyncStorage.setItem('isTokenUpdate', JSON.stringify(this.state.isTokenUpdateRequired))
            AsyncStorage.setItem('DeviceToken', this.state.deviceToken)
          })

        }
      }
    })
  }

  async requestPermission() {
    try {
      await firebase.messaging().requestPermission();
      // User has authorised
      this.getFCMToken();
    } catch (error) {
      // User has rejected permissions
      console.log('permission rejected');
    }
  }

  render() {
    const { checkedSignIn, signedIn, notificationRouteScreen, uuid ,isFavourite} = this.state;

    if (!checkedSignIn) {
      return null;
    }

    const InitialNavigator = createSwitchNavigator({
      Splash: SplashScreen,
      App: createRootNavigator(signedIn)
    },{
      initialRouteName: this.state.isFromNotification ? 'App' : 'Splash'
    })
    

    return (
      <View style={styles.container}>
        {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
        <NavigationContainer>
          <InitialNavigator 
            screenProps={{ isComeFromNotification: (notificationRouteScreen != null) ? true : false , uuid: uuid , isFavourite : isFavourite}}
            ref={navigatorRef => {
            NavigationService.setTopLevelNavigator(navigatorRef);
            }}
          />
        </NavigationContainer>
     </View> 
    );

  }

}

const mapStateToProps = state => ({
  isConnected: state.offlineReducer.isConnected,
});



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default connect(mapStateToProps)(App);