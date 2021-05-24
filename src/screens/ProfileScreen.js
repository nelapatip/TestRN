import React from 'react';
import { StyleSheet, Text, View, ScrollView, Platform, SafeAreaView } from 'react-native';
import AsyncStorage  from "@react-native-community/async-storage";
import { connect } from "react-redux";
import { COLOR } from '../constants/Colors'
import { Normalize, NormalizeLayout } from '../utils/Scale'
import { CONSTANTS } from '../constants/Constants'
import Tags from './Interests/Tags'
import NavigationHeader from '../utils/NavigationHeader'
import RoundedBlueButton from '../utils/CustomButtons/RoundedBlueButton'
import { getUserDetails } from "../actions/LoginActions";
import fonts from '../utils/CortellisFonts'
import OfflineNotice from '../utils/OfflineNotice'
import firebase from 'react-native-firebase'
import { NativeModules } from "react-native";
import UserPreferencesModel from '../models/UserPreferencesModel'
import {name as app_name, version as app_version}  from '../../package.json';
import { CommonActions } from '@react-navigation/native';

let Analytics = firebase.analytics();

class ProfileScreen extends React.Component {
  static navigationOptions = {
    title: 'My Profile',
    headerShown: false
  };

  constructor(props) {
    super(props)

    this.state = {
      final: [],
      email: ''
    }

  }

  componentDidMount() {
    Analytics.logEvent(CONSTANTS.FIREBASE_ANALYTICS.PROFILE_TAB_CLICK, { "platform": Platform.OS, "userId": global.userID })
    this._fetchPrefrenceData()
  }

  _fetchPrefrenceData = () => {
    AsyncStorage.getItem('userObject', (err, result) => {
      if (err) {
      } else {
        if (result == null) {
          console.log("null value recieved", result);
        } else {
          userData = JSON.parse(result)
          let emailLocal = userData['1p:eml']
          this.setState({ email: emailLocal }, () => {
            AsyncStorage.getItem(emailLocal, (err, result) => {
              if (err) {
              } else {
                if (result !== null) {
                  let localJson = JSON.parse(result)
                  if (localJson != undefined) {
                    let userPreferenceModel = new UserPreferencesModel(localJson.filter, true)
                    this.ParseData(userPreferenceModel.getOptionsForDisplay())
                  }
                }
              }
            });
          })
        }
      }
    });
  }

  ParseData(data) {
    arr = []
    data.map(item => {
      item.member.map(memberItem => {
        if (memberItem.isSelected) {
          arr.push(memberItem.title)
        }
      })
    })
    // return arr
    this.setState({ final: arr })
  }

  render() {

    return (
      <View style={styles.mainview}>
        <SafeAreaView style={styles.SafeAreaViewTop}>
          <NavigationHeader title={'Profile'} back={false}></NavigationHeader>
        </SafeAreaView>
        {this.renderProfileData()}
        <OfflineNotice ConnectionStatus={this.props.isConnected} />

      </View>
    )
  }

  async handleLogOut() {
    Analytics.logEvent(CONSTANTS.FIREBASE_ANALYTICS.SIGN_OUT, { "platform": Platform.OS })

    try {
      AsyncStorage.multiRemove(['userToken', 'LastUpdatedFavDate', 'LastUpdatedDate'], () => {
        //Database.clearDB()
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
    if (Platform.OS == 'android') {
      NativeModules.CookieRemover.removeCookies((err, name) => {
        console.log(err, name);
      });

    }
  }

  renderProfileData = () => {
    return (
      <ScrollView>
        <Text style={[styles.headerText, { marginTop: NormalizeLayout(40) }]}>{CONSTANTS.ACCOUNT_SETTINGS}</Text>
        <Text style={styles.mailview}>{this.state.email}</Text>
        <View style={{ flex: 1, width: '100%', alignItems: 'center' }}>
          <RoundedBlueButton text={CONSTANTS.SIGN_OUT} blueButtonStyle={styles.roundedButtonStyle} textStyle={styles.blueTextStyle} onPress={() => this.handleLogOut()}></RoundedBlueButton>
        </View>
        <View style={styles.bottomView}>
          <Text style={styles.headerText}>{CONSTANTS.YOUR_INTERESTS}</Text>
          {this.RenderInterestsButtonView()}


          <View style={{ flex: 1, width: '100%', alignItems: 'center', marginBottom: NormalizeLayout(130) }}>
            <RoundedBlueButton text={CONSTANTS.UPDATE_INTERESTS} blueButtonStyle={styles.roundedWhiteButtonStyle} textStyle={styles.whiteTextStyle}
              onPress={() =>
                this.props.navigation.navigate('UserPref',
                  {
                    updateInterest: true,
                    updateInterestOnProfile: () => {
                      this._fetchPrefrenceData()
                    }
                  }, Analytics.logEvent(CONSTANTS.FIREBASE_ANALYTICS.UPDATE_INTEREST, { "platform": Platform.OS, "userId": global.userID }))
              }>
            </RoundedBlueButton>

            <Text style={[styles.headerText ,{ fontSize: Normalize(15)}]}>Version {app_version.substr(0, app_version.lastIndexOf("."))}</Text>

          </View>

        </View>
      </ScrollView>
    )
  }

  RenderInterestsButtonView = () => {

    return (

      <View style={{ alignItems: 'center', justifyContent: 'center', alignContent: 'center', marginLeft: NormalizeLayout(28), marginRight: NormalizeLayout(28), marginTop: NormalizeLayout(20) }} >
        <Tags
          initialTags={this.state.final}
          profileTags={true}
          tagContainerStyle={styles.roundedSmallButtonStyle}
          tagTextStyle={styles.smallTextStyle}
          onTagPress={() => { }}
        />
      </View>

    )
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
  },

  headerview: {
    justifyContent: 'space-between',
    backgroundColor: COLOR.TAB_BG_COLOR,
    height: NormalizeLayout(80),
    fontFamily: fonts.SourceSansProRegular,

  },
  labelValue: {
    marginTop: NormalizeLayout(3),
    marginLeft: NormalizeLayout(5),
    marginRight: NormalizeLayout(5),
    height: NormalizeLayout(15),
    fontSize: Normalize(12),
    color: COLOR.PRIMARY_TEXT_COLOR,
    fontFamily: fonts.SourceSansProRegular,


  },
  headerText: {
    textAlign: 'center',
    fontSize: Normalize(22),
    lineHeight: NormalizeLayout(28),
    color: COLOR.LIGHT_GRAY_TEXT,
    fontFamily: fonts.SourceSansProRegular,


  },
  roundedButtonStyle: {
    paddingBottom: NormalizeLayout(16),
    paddingTop: NormalizeLayout(12),
    paddingLeft: NormalizeLayout(50),
    paddingRight: NormalizeLayout(50),
    backgroundColor: COLOR.THEME_COLOR,
    borderRadius: NormalizeLayout(24),
    height: NormalizeLayout(48),
    fontFamily: fonts.SourceSansProRegular,

  },
  roundedSmallButtonStyle: {

    paddingLeft: NormalizeLayout(17),
    paddingRight: NormalizeLayout(17),
    backgroundColor: COLOR.THEME_COLOR,
    borderRadius: NormalizeLayout(20),
    height: Normalize(40),
    margin: Normalize(5),
    fontFamily: fonts.SourceSansProRegular,

  },
  blueTextStyle: {
    textAlign: 'center',
    color: COLOR.WHITE,
    fontSize: Normalize(16),
    lineHeight: NormalizeLayout(20),
    fontWeight: '400',
    fontFamily: fonts.SourceSansProRegular,

  },
  smallTextStyle: {
    textAlign: 'center',
    color: COLOR.WHITE,
    fontSize: Normalize(14),
    lineHeight: NormalizeLayout(18),
    fontWeight: 'normal',
    fontFamily: fonts.SourceSansProRegular,

  },
  bottomView: {
    flexDirection: 'column',
    flex: 1,
    marginTop: NormalizeLayout(80)
  },
  roundedWhiteButtonStyle: {
    marginTop: NormalizeLayout(19.5),
    marginBottom: NormalizeLayout(41.5),
    width: NormalizeLayout(190),
    height: NormalizeLayout(50),
    paddingBottom: NormalizeLayout(16.5),
    paddingTop: NormalizeLayout(12.5),
    paddingRight: NormalizeLayout(25),
    paddingLeft: NormalizeLayout(25),
    backgroundColor: '#FFFFFF',
    borderRadius: NormalizeLayout(24),
    borderWidth: NormalizeLayout(1),
    borderColor: COLOR.THEME_COLOR,
    fontFamily: fonts.SourceSansProRegular,

  },
  whiteTextStyle: {
    textAlign: 'center',
    color: COLOR.BUTTON_TEXT_COLOR,
    fontSize: Normalize(16),
    lineHeight: NormalizeLayout(20)
  },
  mailview: {
    color: COLOR.PRIMARY_TEXT_COLOR,
    fontSize: Normalize(18),
    lineHeight: NormalizeLayout(23),
    marginTop: NormalizeLayout(10),
    marginBottom: NormalizeLayout(20),
    textAlign: 'center'
  },
  SafeAreaViewTop: {
    backgroundColor: COLOR.HEADER_BG
  },

});


const mapStateToProps = state => ({
  isConnected: state.offlineReducer.isConnected,

});


const mapDispatchToProps = dispatch => ({
  getUserDetails: () => dispatch(getUserDetails()),
  logoutUser: () => dispatch({ type: 'USER_LOGOUT' })
});

export default connect(mapStateToProps, mapDispatchToProps)(ProfileScreen);