import React from 'react';
import { ScrollView, StyleSheet, Text, View, BackHandler, ActivityIndicator, Platform, Alert, NativeModules} from 'react-native';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import AsyncStorage from "@react-native-community/async-storage";

import { connect } from "react-redux";


import ExpandableList from './ExpandableList'
import ExpandableSection from './ExpandableSection'
import SvgLogoColored from '../../../assets/svgimage/LogoColored'
import { Normalize, NormalizeLayout } from '../../utils/Scale'
import { CONSTANTS } from '../../constants/Constants'
import { COLOR } from '../../constants/Colors'
import fonts from '../../utils/CortellisFonts'
import CortellisButton from '../../utils/CortellisActionButton'
import { fetchAllPreferences, clearUserPrefs, updatePreferencesOnUserSelection, setUserPreferencesInGlobalState } from '../../actions/PreferenceActions'
import { getUserToken, checkUserValidity, getUserDetails } from "../../actions/LoginActions";
import { fetchDeviceToken, sendDeviceToken } from "../../actions/DeviceRegistrationAction"
import NotificationNotice from '../../utils/NotificationNotice'
import firebase from 'react-native-firebase'
import UserPreferencesModel from '../../models/UserPreferencesModel'
import { CommonActions } from '@react-navigation/native';

let Analytics = firebase.analytics();

class UserPref extends React.Component {
  constructor(props) {
    super(props)
    !this.props.navigation.getParam('updateInterest') ? this._checkUserValidity() : this.isFromUpdateInterest()
    this.state = {
      userPreferenceDataSource: this.props.preferences.data,
      userPreferenceModel: null,
      openOptions: ["0"],
      footerHeight: 100,
      loading: true,
      email: '',
      deviceToken: '',
      platform: '',
    }
  }

  static navigationOptions = {
    headerShown: false
  };

  isFromUpdateInterest = () => {
    this._shouldShowUserPref();
    this.props.navigation.setParams({ hideTabBar: true })
  }

  _checkUserValidity = () => {
    if (this.props.isConnected) {
      AsyncStorage.getItem('userToken', (err, result) => {
        if (err) {
        } else {
          if (result == null) {
          } else {
            checkUserValidity(result).then(
              res => {
                if (res) {
                  this._shouldShowUserPref()
                } else {
                  Alert.alert(
                    'Alert',
                    'You do not have the necessary Regulatory Entitlements',
                    [
                      {text: 'OK', onPress:() => {this.handleLogOut()}, style: 'cancel'}
                    ]
                  );
                }
              }
            ).catch((err) => {
              this._shouldShowUserPref()
            })
          }
        }
      });
    } else {
      this._shouldShowUserPref()
    }
  }

  async handleLogOut() {
    Analytics.logEvent(CONSTANTS.FIREBASE_ANALYTICS.SIGN_OUT, { "platform": Platform.OS })

    try {
      AsyncStorage.multiRemove(['userToken', 'LastUpdatedFavDate', 'LastUpdatedDate' ], () => {
        this.props.logoutUser()
        this.props.navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              { name: 'Authentication' }
            ],
          })
        );
      })
    } catch (err) {
      console.log(`The error is: ${err}`)
    }
    if(Platform.OS=='android'){
    NativeModules.CookieRemover.removeCookies((err, name) => {
      console.log(err, name);
    });

    }
  }

  _shouldShowUserPref = () => {
    AsyncStorage.getItem('userObject', (err, result) => {
      if (err) {
      } else {
        if (result == null) {
          console.log("null value recieved", result);
        } else {
          userData = JSON.parse(result)
          let emailLocal = userData['1p:eml']
          let userID = userData['1p:pid']
          global.userID = userID
          AsyncStorage.getItem(emailLocal, (err, result) => {
            if (err) {
            } else {
              if (result == null) {
                console.log("null value recieved", result);
                this.setState({ loading: false })
              } else {
                console.log("result", result);
                this.props.navigation.navigate('MainTab');
                setTimeout(() => {
                  this.setState({ loading: false })
                }, 1000); 
              }
            }
          });
        }
      }
    });
  };

  requestForRegisterToken = async () => {
    AsyncStorage.getItem('userObject', (err, result) => {
      if (err) {
      } else {
        if (result == null) {
          console.log("null value recieved", result);
        } else {
          userData = JSON.parse(result)
          AsyncStorage.getItem('DeviceToken', (deviceTokenErr, result) => {
            if (deviceTokenErr) {

            }
            else {
              if (result == null) {
              }
              else {
                this.setState({
                  deviceToken: result
                })
                AsyncStorage.getItem('userToken', (err, userTokenResult) => {
                  if (err) {

                  }
                  else {
                    if (userTokenResult == null) {

                    }
                    else {
                      //N/W call
                      let tokenRequest = {
                        userMobileDeviceInfo: {
                          userId: userData['1p:pid'],
                          emailId: userData['1p:eml'],
                          deviceToken: this.state.deviceToken,
                          platform: this.state.platform
                        }
                      }
                      this.props.sendDeviceToken(userTokenResult, tokenRequest)
                    }
                  }

                })

              }
            }
          })

        }
      }
    })

  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
  }

  handleBackButton = () => {
    if(this.props.navigation.getParam('updateInterest')) {
      this.props.navigation.goBack()
      return true;
    } else {
      return true;
    }
  }
  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    this.setState({ loading: true })

    if (Platform.OS == 'android') {
      this.setState({ platform: 'GCM' })
    }
    else {
      this.setState({ platform: 'APNS' })
    }

    AsyncStorage.getItem('DeviceToken', (err, result) => {
      if (result == null) {
        if (Platform.OS == 'android') {
          this.checkPermission();
        }
        else {
          this.handlePushNotificationIOS()
        }
      }
      else {
        this.requestForRegisterToken()
      }
    })

    AsyncStorage.getItem('userObject', (err, result) => {
      if (err) {
      } else {
        if (result == null) {
          console.log("null value recieved", result);
        } else {
          userData = JSON.parse(result)
          let emailLocal = userData['1p:eml']
          AsyncStorage.getItem(emailLocal, (err, result) => {
            if (err) {
            } else {
              if (result == null) {
                AsyncStorage.getItem('userToken', (err, result) => {
                  if (err) {
                  } else {
                    if (result == null) {
                    } else {
                      this.props.fetchAllPreferences(result)
                    }
                  }
                });
              } else {
                let localJson = JSON.parse(result)
                if (localJson != undefined) {
                  this.props.setUserPreferencesInGlobalState(localJson)
                }
              }
            }
          })
        }
      }
    });
  }

  handlePushNotificationIOS() {

    PushNotificationIOS.addEventListener('register', token => {
      console.log("APNS Device Token ::" + token)
      AsyncStorage.getItem('DeviceToken', (err, result) => {
        if (result == null) {
          this.setState({
            deviceToken: token,
          }, () => {
            AsyncStorage.setItem('DeviceToken', this.state.deviceToken)
            this.requestForRegisterToken()

          })
        }
        else {

          if (token != result) {
            this.setState({
              deviceToken: token,
            }, () => {
              AsyncStorage.setItem('DeviceToken', this.state.deviceToken)
              this.requestForRegisterToken()
            })

          }
        }
      })


    })

    PushNotificationIOS.addEventListener('registrationError', registrationError => {
      console.log(registrationError, '--')
    })

    PushNotificationIOS.addEventListener('notification', function (notification) {
      if (!notification) {
        return
      }

    })


    PushNotificationIOS.getInitialNotification().then(notification => {
      if (!notification) {
        return
      }

    })
    PushNotificationIOS.requestPermissions()
  }


  //1
  async checkPermission() {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      this.getFCMToken();
    } else {
      this.requestPermission();
    }
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

  async getFCMToken() {
    fcmToken = await firebase.messaging().getToken();

    AsyncStorage.getItem('DeviceToken', (err, result) => {
      if (result == null) {
        this.setState({
          deviceToken: fcmToken,
        }, () => {
          AsyncStorage.setItem('DeviceToken', this.state.deviceToken)
          this.requestForRegisterToken()
        })
      }

      else {
        if (fcmToken != result) {
          this.setState({
            deviceToken: fcmToken,
          }, () => {
            AsyncStorage.setItem('DeviceToken', this.state.deviceToken)
            this.requestForRegisterToken()
          })

        }
      }
    })
  }



  componentWillReceiveProps(newProps) {
    if (newProps.User != null) {
      if (this.props.User !== newProps.User) {
        // this.requestForRegisterToken(newProps.User)
        AsyncStorage.getItem('isTokenUpdate', (err, result) => {
          if (result != null) {
            if (JSON.parse(result)) {
              this.requestForRegisterToken()
            }
          }
          /*if (result == null) {
            this.requestForRegisterToken(newProps.User)
          }
          else {
            if (!JSON.parse(result)) {
              this.requestForRegisterToken(newProps.User)
            }
          }*/
        })
      }
    }

    if (newProps.preferences.data) {
      var userPreferenceModel = newProps.preferences.data
      let initialOptions = userPreferenceModel.getOptionsForDisplay()
      this.setState({
        userPreferenceDataSource: initialOptions,
        userPreferenceModel: userPreferenceModel,
      })
    }
    else {
      AsyncStorage.getItem('userObject', (err, result) => {
        if (err) {
        } else {
          if (result == null) {
            console.log("null value recieved", result);
          } else {
            userData = JSON.parse(result)
            let emailLocal = userData['1p:eml']
            AsyncStorage.getItem(emailLocal, (err, result) => {
              if (err) {
              } else {
                if (result !== null) {
                  let localJson = JSON.parse(result)
                  if (localJson != undefined) {
                    this.props.setUserPreferencesInGlobalState(localJson)
                  }
                }
              }
            })
          }
        }
      })
    }
  }

  _renderSection = (section, sectionId, isOpen) => {
    return (
      <ExpandableSection title={section} sectionId={sectionId} isOpen={isOpen} />
    )
  };

  _onContinueButtonPress = () => {

    AsyncStorage.setItem('should', JSON.stringify({ "value": "true" }), (err, result) => {
      console.log("error", err, "result", result);
    }).then(() => {
      AsyncStorage.getItem('userObject', (err, result) => {
        if (err) {
        } else {
          if (result == null) {
            console.log("null value recieved", result);
          } else {
            userData = JSON.parse(result)
            let emailLocal = userData['1p:eml']
            AsyncStorage.setItem(emailLocal, JSON.stringify(this.state.userPreferenceModel), (err, result) => {
              let model = this.state.userPreferenceModel
              let localJson = JSON.parse(JSON.stringify(model))
              if (localJson != undefined) {
                this.props.setUserPreferencesInGlobalState(localJson)
              }
            }).then(() => {
              this.props.clearUserPrefs()
              var isFromUpdateInterest = this.props.navigation.getParam('updateInterest') ? this.props.navigation.getParam('updateInterest') : false
              if (isFromUpdateInterest) {
                this.props.navigation.state.params.updateInterestOnProfile()
                this.props.navigation.goBack()
                this.props.navigation.navigate('Alerts')
              }
              else {
                this.props.navigation.navigate('MainTab')
              }
             
            })
          }
        }
      })
    })
  }

  render() {

    return (
      <View style={Styles.container}>
        {(!this.props.isLoading && !(this.state.loading)) && (<Entitlements
          LearnMore={() => this.props.navigation.navigate('LearnMore')}
          data={this.state.userPreferenceDataSource}
          renderSection={this._renderSection}
          openOptions={this.state.openOptions}
          footerHeight={this.state.footerHeight}
          onEntitlementSelection={(index, tagLabel, sectionTitle) => {
            let value = index.initialTags[tagLabel].title
            this.props.updatePreferencesOnUserSelection(sectionTitle, value)
          }} />)}

        {(!this.props.isLoading && this.props.error == null) && (<ContinueButton onLayout={(event) => {
          var { x, y, width, height } = event.nativeEvent.layout;
          this.setState({ footerHeight: height })
        }} title={CONSTANTS.UserPreferencesScreen.buttonText} onPress={this._onContinueButtonPress} />)}

        {(this.props.loading || this.state.loading) && (
          <View style={Styles.loading}>
            <ActivityIndicator color="grey" size="large" />
          </View>
        )}

      </View>

    );
  }
}

const ScreenHeader = (props) => {
  return (
    <View>
      <View style={Styles.logoContainer} ><SvgLogoColored /></View>
      <View><Text style={Styles.questionText}>{CONSTANTS.UserPreferencesScreen.titleQues}</Text></View>
      <View style={{ padding: NormalizeLayout(15), marginTop: NormalizeLayout(21) }}>
        <Text style={[Styles.bottomText]}>{CONSTANTS.UserPreferencesScreen.bottomText1}</Text>
        <Text onPress={props.LearnMore} style={[Styles.bottomText, { color: COLOR.THEME_COLOR }]}>Learn more.</Text>
      </View>
    </View>



  )
}

const Entitlements = (props) => {
  return (
    <View style={Styles.ExpandableListContainer}>
      <ExpandableList
        Header={<ScreenHeader LearnMore={props.LearnMore} />}
        dataSource={props.data}
        headerKey="title"
        memberKey="member"
        openOptions={props.openOptions}
        renderSectionHeaderX={props.renderSection}
        onTagPress={(index, tagLabel, rowId) => {
          props.onEntitlementSelection(index, tagLabel, rowId)
        }}
        footerHeight={props.footerHeight}
      />
    </View>
  )
}

const ContinueButton = (props) => {
  return (
    <View style={{
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'center',
      paddingBottom: NormalizeLayout(15)
    }}
      onLayout={props.onLayout}>
      <CortellisButton buttonText={props.title} width={295} height={48} onPress={props.onPress} />
    </View>
  )
}

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logoContainer: {
    marginTop: NormalizeLayout(35),
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  questionText: {
    color: COLOR.THEME_COLOR,
    fontFamily: fonts.SourceSansProRegular,
    fontWeight: 'normal',
    fontSize: Normalize(28),
    textAlign: 'center',
    marginTop: NormalizeLayout(40)
  },
  bottomText: {
    color: COLOR.GRAY_TEXT,
    fontFamily: fonts.SourceSansProRegular,
    fontSize: Normalize(16),
    fontWeight: 'normal',
    textAlign: 'justify',
  },
  ExpandableListContainer: {
    flex: 2,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    width: Normalize(295),
    height: Normalize(48),
    borderRadius: Normalize(24),
    backgroundColor: '#00A7E0',
    marginBottom: NormalizeLayout(30)
  }
  , text: {
    color: '#fff',
    fontSize: Normalize(16),
    fontWeight: '500',
    textAlign: 'center'
  },
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    backgroundColor: '#fff',
    justifyContent: 'center',
    height: '100%'
  },
});

const mapStateToProps = state => ({
  isConnected: state.offlineReducer.isConnected,
  token: state.loginData.token,
  isLoading: state.preferencesData.loading,
  preferences: state.preferencesData.preferences,
  error: state.preferencesData.errorMessage,
  User: state.loginData.userObject,
});

const mapDispatchToProps = dispatch => ({
  fetchAllPreferences: (a) => dispatch(fetchAllPreferences(a)),
  updatePreferencesOnUserSelection: (section, value) => dispatch(updatePreferencesOnUserSelection(section, value)),
  setUserPreferencesInGlobalState: (json) => dispatch(setUserPreferencesInGlobalState(json)),
  getUserToken: () => dispatch(getUserToken()),
  clearUserPrefs: () => dispatch(clearUserPrefs()),
  getUserDetails: () => dispatch(getUserDetails()),
  sendDeviceToken: (token, params) => dispatch(sendDeviceToken(token, params)),
  logoutUser: () => dispatch({ type: 'USER_LOGOUT' })

});

export default connect(mapStateToProps, mapDispatchToProps)(UserPref);
