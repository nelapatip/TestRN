import React from 'react';
import { StyleSheet, Text, View, Alert, FlatList, TouchableOpacity, SafeAreaView, Animated, ActivityIndicator, Platform, StatusBar, BackHandler, } from 'react-native';
import  AsyncStorage  from "@react-native-community/async-storage";
import { connect } from "react-redux";
import Modal from 'react-native-modal'
import { CheckBox, StyleProvider } from 'native-base'
import { COLOR } from '../../constants/Colors'
import { Normalize, NormalizeLayout } from '../../utils/Scale'
import { CONSTANTS } from '../../constants/Constants'
import NavigationHeader from '../../utils/NavigationHeader'
import fonts from '../../utils/CortellisFonts'
import SvgAdd from '../../../assets/svgimage/Add'
import SvgStar from '../../../assets/svgimage/Star5'
import SvgDelete from '../../../assets/svgimage/Delete'
import BottomBar from '../../utils/BottomBar'
import ListRow from '../../screens/Alerts/ListRow'
import RoundedBlueButton from '../../utils/CustomButtons/RoundedBlueButton'
import { fetchAlerts, deleteAlert, addDocToFavourites, refreshAlertsFromDB } from '../../actions/AlertActions'
import NotificationAlertView from '../../utils/NotificationAlertView'
import TopHeader from '../../utils/TopHeader'
import OfflineNotice from '../../utils/OfflineNotice'
import NotificationNotice from '../../utils/NotificationNotice'
import Moment from 'moment'
import firebase from 'react-native-firebase'
let Analytics = firebase.analytics();
import getTheme from '../../../native-base-theme/components';
import material from '../../../native-base-theme/variables/material';
import AlertPro from "../../utils/AlertPro/index";

import UpdateIos from '../../utils/UpdateChecker'



const notificationDuration = 3000

class AlertScreen extends React.Component {
  static navigationOptions = {
    title: 'Alerts',
    headerShown: false,
  };

  static defaultValue = {
    isFavAdded: false
  };

  constructor(props) {
    super(props);
    this.state = {
      message: '',
      showSortView: false,
      isEditModeOn: false,
      nameCheckboxValue: false,
      dateCheckboxValue: true,
      presentAnimation: new Animated.Value(0),
      alertData: '',
      addDocList: [],
      isAddDocToFavouriteSuccessfull: undefined,
      isDeleteSuccessful: false,
      isDeleteUnSuccessful: false,
      showNotification: false,
      status: '',
      message: '',
      isCheckEnable: false,
      alertIDsToBeDeleted: [],
      loading: false,
      hasAPIFailed: false,
      isConnected: undefined,
      isFetching: false,
    }
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    Analytics.logEvent(CONSTANTS.FIREBASE_ANALYTICS.ALERT_TAB_CLICK, { "platform": Platform.OS, "userId": global.userID })
    AsyncStorage.getItem('userToken', (err, result) => {
      if (err) {
      } else {
        if (result == null) {
        } else {
          this.props.getAlerts(result, global.userID)
        }
      }
    });
    if (this.props.screenProps.isComeFromNotification) {
      this.props.screenProps.isComeFromNotification = false
      if(this.props.screenProps.isFavourite){
        this.props.navigation.navigate('Favourites', {uuid: this.props.screenProps.uuid , isComingFromNotification: true , 
          onGoBack: (callback) => callback(),
        });
      }else{
        this.props.navigation.navigate('AlertDetailScreen', {uuid: this.props.screenProps.uuid , isComingFromNotification: true , 
          onGoBack: (callback) => callback(),
        });
      }
     
  }

//   if(Platform.OS === "ios"){
//     UpdateIos.promptUser()
// }
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
  }




  handleBackButton = () => {
    BackHandler.exitApp()
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      isConnected: newProps.isConnected,
      hasAPIFailed: false
    })

    if (newProps.alerts.data) {
      var data = newProps.alerts.data.alerts
      this.sortAlertList(data)

      this.setState({
        isFetching: false,
      })
    }

    if (this.props.deleteAlertRes === newProps.deleteAlertRes) {
      setTimeout(() => {
        this.props.reset()
      }, 3000);
    }

    if (newProps.deleteAlertRes) {
      this.setState({ alertIDsToBeDeleted: [] })
    }
  }

  addDocToFavourites = async () => {
    this.setState({ loading: true })


    let targetDocuments = []
    this.state.alertData.map(alert => {
      alert.notifications.map(notification => {
        notification.documents.map(document => {
          if (this.state.addDocList.includes(document.idrac)) {
            targetDocuments.push(document)
          }
        })
      })
    })

    AsyncStorage.getItem('userToken', (err, result) => {
      if (err) {
      }
      else {
        if (result == null) {
        }
        else {
          addDocToFavourites(result, targetDocuments, global.userID).then(res => {
            if (res != "") {
              if (res.status === 'success') {
                if (!this.state.isAddDocToFavouriteSuccessfull) {
                  this.setState({
                    status: res.status,
                    message: res.message,
                    addDocList: [],
                    alertIDsToBeDeleted: [],
                    isAddDocToFavouriteSuccessfull: true,
                    showNotification: true,
                    loading: false
                  }, () => {
                    this.startAnimation()
                  })
                }
              }
              else {
                this.setState({
                  status: res.status,
                  message: res.message,
                  addDocList: [],
                  alertIDsToBeDeleted: [],
                  isAddDocToFavouriteSuccessfull: false,
                  showNotification: true,
                  loading: false

                }, () => {
                  this.startAnimation()
                })
              }
            }
          }).catch(() => {
            this.setState({ loading: false, hasAPIFailed: true })
          })
        }
      }
    });


  }

  startAnimation = () => {
    Animated.timing(this.state.presentAnimation, {
      toValue: 1,
      duration: 500,
      delay: 0,
      useNativeDriver: true
    }).start(() => {
      setTimeout(() => {
        if (this.state.showNotification) {
          this.setState({ showNotification: !this.state.showNotification });
        }
      }, notificationDuration);
    })
  }

  render() {
    let bottomBarTranslateY = this.state.presentAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [-100, 0]
    })
    return (
      <View style={styles.mainview}>
        {(this.props.loading || this.state.loading) && (
          <View style={styles.loading}>
            <ActivityIndicator color="grey" size="large" />
          </View>
        )}
        <StatusBar
          backgroundColor={COLOR.HEADER_BG}
          barStyle="light-content"
        />
        {this.state.showNotification && (
          <Animated.View style={{ position: 'absolute', width: '100%', zIndex: 2, transform: [{ translateY: bottomBarTranslateY }] }}>

            {this.state.showNotification != "" && <NotificationAlertView BGColor={this.state.status == 'success' ? COLOR.GREEN_SUCCESS : COLOR.PINK} titleviewstyle={[styles.titleviewstyle, { backgroundColor: this.state.status == 'success' ? COLOR.GREEN_SUCCESS : COLOR.PINK }]} headerstyle={styles.headerstyle} title={this.state.message}></NotificationAlertView>}

          </Animated.View>
        )}
        {(this.props.deleteAlertRes !== null && this.props.deleteAlertRes) && (
          <NotificationNotice status={'Success'} displayText={"Alert deleted successfully."} />
        )}
        {(this.props.deleteAlertRes !== null && !this.props.deleteAlertRes) && (
          <NotificationNotice status={'Fail'} displayText={"Something went wrong."} />
        )}
        {(this.state.hasAPIFailed) && (
          <NotificationNotice status={'Fail'} displayText={"Something went wrong."} />
        )}
        <SafeAreaView style={styles.SafeAreaViewTop}>
          <NavigationHeader showActionButton={true} title={CONSTANTS.ALERT} action={CONSTANTS.NEW} actionPress={this.newPress} back={false} optionalItem={CONSTANTS.EDIT} ></NavigationHeader>
        </SafeAreaView>
        {this.state.alertData.length > 0 && (
          <TopHeader
            count={this.state.alertData.length}
            leftText={this.state.alertData.length > 1 ? CONSTANTS.ALERTS_LABEL : CONSTANTS.ALERT_LABEL_SINGLE}
            button1Text={CONSTANTS.SORT}
            isEditModeOn={this.state.isEditModeOn}
            button2Text={this.state.isEditModeOn ? CONSTANTS.DONE : CONSTANTS.EDIT}
            button1OnPress={() => {
              if (this.state.alertData.length > 0) {
                this.onSort()
              }
            }}
            button2OnPress={() => {
              this.props.reset()
              this.setState({ alertIDsToBeDeleted: [] })
              if (this.state.alertData.length > 0) {
                this.setState({ isEditModeOn: !this.state.isEditModeOn }, () => {
                  if (this.state.isEditModeOn) {
                    this.props.navigation.setParams({ hideTabBar: true })
                  }
                  else {
                    this.props.navigation.setParams({ hideTabBar: false })
                  }
                })
              }
              else {
                if (this.state.isEditModeOn) {
                  this.setState({ isEditModeOn: !this.state.isEditModeOn }, () => {
                    if (this.state.isEditModeOn) {
                      this.props.navigation.setParams({ hideTabBar: true })
                    }
                    else {
                      this.props.navigation.setParams({ hideTabBar: false })
                    }
                  })
                }
              }
            }}
          />
        )}
        {this.state.alertData.length > 0 && this.AlertsList()}
        {this.state.alertData.length == 0 && !this.props.loading && (<EmptyAlertScreenView onAddPress={this.newPress} />)}
        {this.state.showSortView && (this.sortView())}
        {this.state.isEditModeOn && (
          <SafeAreaView style={[styles.SafeAreaViewTop, { backgroundColor: '#fff' }]} >
            <BottomBar
              showItems={1}
              isNetConnected={this.state.isConnected}
              isFavEnabled={this.state.alertIDsToBeDeleted.length != 0}

              tab2Text={CONSTANTS.DELETE}
              tab2SelectionColor={COLOR.PINK}
              tab2UnSelectionColor={COLOR.PINK}

              tab2Image={<SvgDelete fill={COLOR.PINK} />}
              tab2SelectedImage={<SvgDelete fill={COLOR.PINK} />}
              //onTab1Press={(isSelected) => { (isSelected) && this.props.isConnected && this.addDocToFavourites() }}
              onTab3Press={()=>{}}
              onTab1Press={()=>{}}
              //onTab2Press={() => { this.props.isConnected && this.deletePress(this.alertIDToBeDeleted) }}>
              onTab2Press={() => {
                if (Platform.OS === 'ios') {
                  Alert.alert(
                    'Do you want to delete this alert from the Cortellis platform ?',
                    'You will no longer receive mobile notifications or emails. \n This action cannot be undone.',
                    [
                      { text: 'OK', onPress: () => { this.deletePress() }, style: 'destructive' },
                      { text: 'Cancel', onPress: () => { }, style: 'cancel' }
                    ],
                    { cancelable: false },
                  );
                } else {
                  this.AlertPro.open()
                }
              }}>
            </BottomBar>
          </SafeAreaView>)}
        {/* {(this.props.loading || this.state.loading) && (
          <View style={styles.loading}>
            <ActivityIndicator color="grey" size="large" />
          </View>
        )} */}
        <OfflineNotice ConnectionStatus={this.props.isConnected} />
        <AlertPro
          ref={ref => {
            this.AlertPro = ref;
          }}
          onConfirm={() => {
            this.AlertPro.close()
            this.deletePress()
          }}
          onCancel={() => this.AlertPro.close()}
          title="Do you want to delete this alert from the Cortellis platform ?"
          message={'You will no longer receive mobile notifications or emails. \nThis action cannot be undone.'}
          textCancel="Cancel"
          textConfirm="OK"
          customStyles={{
            buttonCancel: {
              backgroundColor: '#00A7E0'
            },
            buttonConfirm: {
              backgroundColor: "#F53D3D"
            }
          }}
        />
      </View>
    )
  }


  deletePress = async () => {
    Analytics.logEvent(CONSTANTS.FIREBASE_ANALYTICS.DELETE_ALERT, { "platform": Platform.OS, "userId": global.userID })
    AsyncStorage.getItem('userToken', (err, result) => {
      if (err) {
      }
      else {
        if (result == null) {
        } else {
          this.props.deleteAlert(result, this.state.alertIDsToBeDeleted, global.userID)
        }
      }
    });
  }

  newPress = () => {
    this.props.navigation.navigate('CreateAlert', {
      mode: 'create',
    });
  }

  onSort = () => {
    this.setState({ showSortView: true })
  }

  sortView = () => {
    return (
      <Modal
        style={{ margin: 0 }}
        isVisible={this.state.showSortView}
        animationIn="slideInDown"
        animationOut="slideOutRight"
        onBackdropPress={() => { this.setState({ showSortView: !this.state.showSortView }) }}
        onSwipeComplete={() => { this.setState({ showSortView: !this.state.showSortView }) }}
      // swipeDirection="up"
      >
        <View style={{ width: '100%', height: '100%', flexDirection: 'column', backgroundColor: 'transparent', zIndex: 2, position: 'absolute' }}>
          <View style={styles.layoutview}>
            <SafeAreaView style={{ width: '100%', height: '100%', backgroundColor: COLOR.WHITE }} >
              <View style={[styles.rowView, { backgroundColor: '#F6F7F9', flexDirection: 'row',alignItems:'center' }]}>
                <Text style={[styles.sortHeader, {}]}>{CONSTANTS.SORT}</Text>
              </View>
              <View style={styles.sortSepView}></View>
              <View style={styles.rowView}>
                <Text style={[styles.sortHeader, { fontFamily: fonts.SourceSansProRegular, color: COLOR.PRIMARY_TEXT_COLOR }]}>{CONSTANTS.BY_DATE}</Text>
                <View style={[styles.checkbox]}>

                    <CheckBox style={styles.checkBoxStyle} checked={this.state.dateCheckboxValue}
                      onPress={() => {
                        if (this.state.dateCheckboxValue) {
                          this.setState({
                            dateCheckboxValue: !this.state.dateCheckboxValue,
                            nameCheckboxValue: !this.state.nameCheckboxValue,

                          })
                        }
                        else if (this.state.nameCheckboxValue) {
                          this.setState({
                            nameCheckboxValue: !this.state.nameCheckboxValue,
                            dateCheckboxValue: !this.state.dateCheckboxValue,

                          })
                        }
                        else {
                          this.setState({
                            nameCheckboxValue: this.state.nameCheckboxValue,
                            dateCheckboxValue: !this.state.dateCheckboxValue
                          })
                        }

                      }}
                    />
                </View>
              </View>
              <View style={[styles.sortSepView, { backgroundColor: '#F6F7F9' }]}></View>
              <View style={styles.rowView}>
                <Text style={[styles.sortHeader, { fontFamily: fonts.SourceSansProRegular, color: COLOR.PRIMARY_TEXT_COLOR }]}>{CONSTANTS.BY_NAME}</Text>
                <View style={[styles.checkbox]}>
                    <CheckBox style={styles.checkBoxStyle} checked={this.state.nameCheckboxValue}
                      onPress={() => {
                        if (this.state.nameCheckboxValue) {
                          this.setState({
                            nameCheckboxValue: !this.state.nameCheckboxValue,
                            dateCheckboxValue: !this.state.dateCheckboxValue,

                          })
                        }
                        else if (this.state.dateCheckboxValue) {
                          this.setState({
                            dateCheckboxValue: !this.state.dateCheckboxValue,
                            nameCheckboxValue: !this.state.nameCheckboxValue
                          })
                        }
                        else {
                          this.setState({
                            nameCheckboxValue: this.state.nameCheckboxValue,
                            dateCheckboxValue: !this.state.dateCheckboxValue,

                          })
                        }
                      }}
                    />
                </View>
              </View>
              <View style={[styles.sortSepView, { backgroundColor: '#F6F7F9' }]}></View>
              <RoundedBlueButton text={CONSTANTS.APPLY} blueButtonStyle={styles.roundedButtonStyle} textStyle={styles.textStyle}
                onPress={() => {
                  this.sortAlertList(this.state.alertData)
                  this.setState({ showSortView: !this.state.showSortView })
                  var sortedOption = this.state.nameCheckboxValue ? CONSTANTS.FIREBASE_ANALYTICS.SORTED_BY_NAME : CONSTANTS.FIREBASE_ANALYTICS.SORTED_BY_DATE
                  Analytics.logEvent(CONSTANTS.FIREBASE_ANALYTICS.SORTING_CHANGES_ALERT, { "platform": Platform.OS, "userId": global.userID, "sortedBy": sortedOption })

                }}
              ></RoundedBlueButton>
            </SafeAreaView>
          </View>
        </View>
      </Modal>
    )
  }
  // keyExtractor={item => item.email}

  onAlertClicked = async (data) => {
    if (!this.state.isEditModeOn) {
      // alert(data.toString())

      this.props.navigation.navigate('AlertDetailScreen', {
        Alert: data,
        onGoBack: () => this.refreshFromDb(global.userID),
      });
    }
  }

  refreshFromDb = (id) => {
    this.props.refreshAlertsFromDB(id)
  }

  onCheckedTrue = (isChecked, data) => {
    // this.state.alertIDsToBeDeleted.push(data.alertId)
    const { alertIDsToBeDeleted } = this.state;
    const isLiked = alertIDsToBeDeleted.indexOf(data.alertId) !== -1;
    if (isLiked) {
      this.setState({ alertIDsToBeDeleted: alertIDsToBeDeleted.filter(i => i !== data.alertId) });
    } else {
      this.setState({ alertIDsToBeDeleted: [...alertIDsToBeDeleted, data.alertId] });
    }

    data.notifications.map((notification) => {
      notification.documents.map((document) => {
        if (isChecked) {
          var found = this.state.addDocList.find(function (element) {
            return element == document.idrac
          });
          if (found == undefined) {
            // this.state.addDocList.push(document.idrac)

            var existingDocList = this.state.addDocList

            existingDocList.push(document.idrac)
            this.setState({
              addDocList: existingDocList,
            })

          }
        }
        else {
          var index = this.state.addDocList.indexOf(document.idrac)
          if (index > -1) {

            var existingDocList = this.state.addDocList
            existingDocList.splice(index, 1);
            this.setState({
              addDocList: existingDocList
            })
            // this.state.addDocList.splice(index, 1);
          }
        }
      })
    })
  }


  renderSeparator = () => {
    return (
      <View style={styles.separatorview}>
      </View>
    );
  };

  getDateFromTimestamp = (timestamp) => {
    let spaceIndex = timestamp.indexOf(' ')
    if (spaceIndex != -1) {
      timestamp = timestamp.substring(0, spaceIndex)
    }
    return timestamp
  }

  sortAlertList(list) {
    let sortedList = [...list]
    if (this.state.alertData.length > 0) {
      if (this.state.nameCheckboxValue) {
        sortedList.sort(function (a, b) {
          if (a.alertName.toLowerCase() > b.alertName.toLowerCase()) {
            return 1;
          }
          if (b.alertName.toLowerCase() > a.alertName.toLowerCase()) {
            return -1;
          }
          // return 0;
        });
      }
      else {
        if (this.state.dateCheckboxValue) {

          sortedList.sort((a, b) => new Moment(b.alertTimestamp, 'DD-MMM-YY hh:mm:ss a') - new Moment(a.alertTimestamp, 'DD-MMM-YY hh:mm:ss a'))
          console.log(sortedList)
        }
      }
    }
    this.setState({ alertData: sortedList })
  }

  onRefresh = () => {
    this.setState({ isFetching: true })
    AsyncStorage.getItem('userToken', (err, result) => {
      if (err) {
      } else {
        if (result == null) {
        } else {
          this.props.getAlerts(result, global.userID, true)
        }
      }
    });
  }

  AlertsList = () => {
    let sortedList = [...this.state.alertData]
    // sortedList.sort((a, b) => new Moment(this.getDateFromTimestamp(b.alertTimestamp)).format('YYYYMMDD') - new Moment(this.getDateFromTimestamp(a.alertTimestamp)).format('YYYYMMDD'))

    return (
      <FlatList
        data={sortedList}
        style={[styles.flatview]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={this.renderSeparator}
        extraData={this.state.alertData}
        onRefresh={() => this.onRefresh()}
        refreshing={this.state.isFetching}
        renderItem={({ item }) =>
          <ListRow
            item={item}
            isEditModeOn={this.state.isEditModeOn}
            onPressed={() => this.onAlertClicked(item)}
            onChecked={(isChecked, item) => this.onCheckedTrue(isChecked, item)}
            isLiked={this.state.alertIDsToBeDeleted.indexOf(item.alertId) !== -1}
          />
        }
      />
    );
  }

}

const styles = StyleSheet.create({
  container: {
    paddingTop: NormalizeLayout(15),
    backgroundColor: '#fff',
  },
  flatview: {
    // marginBottom: NormalizeLayout(70),
  },
  sepview: {
    width: '100%',
    backgroundColor: COLOR.Gray_Sep,
    height: NormalizeLayout(2)
  },
  mainview: {
    flexDirection: 'column',
    flex: 1,
  },
  separatorview: {
    backgroundColor: '#E1E4E6',
    height: 1,
    width: "100%",
  },
  sortHeader: {
    color: COLOR.LIGHT_GRAY_TEXT,
    fontSize: Normalize(16),
    lineHeight: Normalize(20),
    fontFamily: fonts.SourceSansProBold,
    marginLeft: NormalizeLayout(16),
    marginRight: NormalizeLayout(16),

  },
  rowView: {
    flexDirection: 'row',
    height: '20%',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  header: {
    color: COLOR.BLACK_TEXT,
    fontSize: Normalize(16),
    height: Normalize(20),
    justifyContent: 'center',
    fontFamily: fonts.SourceSansProRegular,
  },
  buttonview: {
    marginTop: NormalizeLayout(16),
    marginBottom: NormalizeLayout(16),
    marginLeft: NormalizeLayout(39),
    marginRight: NormalizeLayout(39),
    backgroundColor: 'red'
  },
  button: {
    color: COLOR.BUTTON_TEXT_COLOR,
    fontSize: Normalize(16),
    height: Normalize(20),
    justifyContent: 'center',
    width: '100%',
    alignItems: 'center',
    textAlign: 'center',
    fontFamily: fonts.SourceSansProRegular,
  },
  sortSepView: {
    backgroundColor: '#D7DADA',
    height: 1,
    width: "100%",
  },
  sepview: {
    backgroundColor: COLOR.Gray_Sep,
    height: Normalize(2),
    width: '100%'
  },
  layoutview: {
    flexDirection: 'column',
    height: '40%',
    zIndex: 3,
    backgroundColor: COLOR.WHITE,
  },
  titleview: {
    justifyContent: 'center',
    height: '100%'
  },
  SafeAreaViewTop: {
    backgroundColor: COLOR.HEADER_BG,
  },
  checkbox: {
    height: NormalizeLayout(20),
    marginRight: NormalizeLayout(26)
  },
  checkBoxStyle: {
    width: 22,
    height: 22,
    alignItems: 'center'
  },
  titleviewstyle: {
    height: Normalize(65),
    backgroundColor: COLOR.PINK,
    justifyContent: 'center',
    width: '100%',
  },
  headerstyle: {
    fontSize: Normalize(16),
    lineHeight: Normalize(20),
    marginLeft: NormalizeLayout(22),
    marginRight: NormalizeLayout(21),
    fontFamily: fonts.SourceSansProRegular,
  },
  roundedButtonStyle: {
    marginTop: NormalizeLayout(12),
    marginBottom: NormalizeLayout(16),
    marginLeft: NormalizeLayout(39),
    marginRight: NormalizeLayout(39),
    paddingBottom: NormalizeLayout(16),
    paddingTop: NormalizeLayout(12.5),
    paddingLeft: NormalizeLayout(42),
    paddingRight: NormalizeLayout(40),
    backgroundColor: '#FFFFFF',
    borderRadius: NormalizeLayout(24),
    borderWidth: NormalizeLayout(1),
    borderColor: COLOR.THEME_COLOR,
    height: NormalizeLayout(49)
  },
  textStyle: {
    textAlign: 'center',
    color: COLOR.BUTTON_TEXT_COLOR,
    fontSize: Normalize(16),
    lineHeight: NormalizeLayout(20),
    fontFamily: fonts.SourceSansProRegular,

  },
  newContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  },
  newHeader: {
    color: COLOR.DARK_GRAY_TEXT,
    marginLeft: NormalizeLayout(10),
    fontSize: Normalize(28),
    height: NormalizeLayout(36),
    fontFamily: fonts.SourceSansProRegular
  },
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.5,
    alignItems: 'center',
    backgroundColor: '#fff',
    justifyContent: 'center',
    height: '100%'
  },
});

/*
Bind state and dispatch actions to props
*/
const mapStateToProps = (state) => ({
  loading: state.alertsData.loading,
  alerts: state.alertsData.alerts,
  errorMessage: state.alertsData.errorMessage,
  success: state.alertsData.success,
  deleteAlertRes: state.alertsData.deleteAlertRes,
  error: state.alertsData.errorMessage,
  isConnected: state.offlineReducer.isConnected,

});

const mapDispatchToProps = dispatch => {
  return {
    getAlerts: (token, userID, pullToRefreshFlag) => { dispatch(fetchAlerts(token, userID, pullToRefreshFlag)); },
    addDocToFavourites: (token, params, userID) => { dispatch(addDocToFavourites(token, params, userID)); },
    refreshAlertsFromDB: (userID) => { dispatch(refreshAlertsFromDB(userID)) },
    deleteAlert: (token, id, userID) => { dispatch(deleteAlert(token, id, userID)) },
    reset: () => { dispatch({ type: 'RESET' }) }
  };
};

const EmptyAlertScreenView = (props) => {
  return (
    <View style={[styles.newContainer]}>
      <TouchableOpacity onPress={props.onAddPress}>
        <SvgAdd />
      </TouchableOpacity>
      <Text style={styles.newHeader}>{CONSTANTS.NewAlert.create_new}</Text>
    </View>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(AlertScreen);