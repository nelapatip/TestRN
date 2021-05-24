import React from 'react';
import { TextInput, Keyboard, UIManager, View, SectionList, StyleSheet, Dimensions, SafeAreaView, Animated, ActivityIndicator, Platform, BackHandler, KeyboardAvoidingView } from 'react-native';
import  AsyncStorage from "@react-native-community/async-storage";
import { connect } from "react-redux";
import { createAlert } from '../../actions/AlertActions'
import { editAlert } from '../../actions/AlertActions'

import NotificationNotice from '../../utils/NotificationNotice'
import { COLOR } from '../../constants/Colors'
import { Normalize, NormalizeLayout } from '../../utils/Scale'
import { CONSTANTS } from '../../constants/Constants'
import CheckBoxListRow from './CheckBoxListRow'
import SwitchListRow from './SwitchListRow'
import HeaderListRow from './HeaderListRow';
import SvgPencil from '../../../assets/svgimage/Pencil'
import NotificationAlertView from '../../utils/NotificationAlertView'
import UserPreferencesModel from '../../models/UserPreferencesModel'
import _ from 'lodash'
import { getCountryCode } from '../../utils/Utility'
const window = Dimensions.get('window');

import OfflineNotice from '../../utils/OfflineNotice'
import MoreListRow from './MoreListRow';
import NavigationHeader from '../../utils/NavigationHeader';
import InputSelection from './InputSelection';
import fonts from '../../utils/CortellisFonts'
import firebase from 'react-native-firebase'


let Analytics = firebase.analytics();
var changedSelectionsForAnalytics = []
const notificationDuration = 2800
const { State: TextInputState } = TextInput;
class CreateAlertScreen extends React.Component {

  static navigationOptions = {
    title: 'Create Alert',
    headerShown: false
  };
  constructor(props) {
    super(props);

    this.state = {
      isDBSelected: false,
      alertId: 0,
      alertName: '',
      userUpdatedAlertName: false,
      explicitlyShowOfflineNotification: false,
      userPreferenceModel: null,
      status: '',
      message: '',
      showNotification: false,
      loading: false,
      isAnimated: false,
      shift: new Animated.Value(0),
      presentAnimation: new Animated.Value(0),
      mode: 'create',
      preferencesDataSource: [],
      preferencesDataToShow: [],
      regionsSelectedArray: [],
      categoriesSelectedArray: [],
      topicSelectedArray: [],
      doc_typesSelectedArray: [],
      doc_categoriesSelectedArray: []
    };

    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);


  }

  componentDidMount() {
    const { navigation } = this.props;
    const mode = navigation.getParam('mode');
    const alertTitle = navigation.getParam('alertTitle') ? navigation.getParam('alertTitle') : ''
    const alertId = navigation.getParam('alertId') ? navigation.getParam('alertId') : 0
    this.setState({ mode: mode, alertName: alertTitle, alertId: alertId })
  }
  handleBackButton = () => {
    return true;
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    this.keyboardWillShowSub.remove();
    this.keyboardWillHideSub.remove();
  }

  handleBackButtonClick() {
    this.backPress();
    return true;
  }
  componentWillMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);

    this.keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow);
    this.keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide);

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
              if (result) {
                let localJson = JSON.parse(result)
                if (localJson != undefined) {
                  let userPreferenceModel = new UserPreferencesModel(localJson.filter, true)
                  var optionsToDisplay = userPreferenceModel.getOptionsForDisplay()
                  this.setState({
                    preferencesDataSource: optionsToDisplay,
                    userPreferenceModel: userPreferenceModel
                  }, () => {
                    if (this.state.preferencesDataSource.length > 0) {
                      this.parseData(this.state.preferencesDataSource)
                    }
                  })
                }

                // this.setState({
                //   preferencesDataSource: JSON.parse(result)
                // }, () => {
                //   if (this.state.preferencesDataSource.length > 0) {
                //     this.parseData(this.state.preferencesDataSource)
                //   }
                // })
              }
            }
          })
        }
      }
    })
  }

  startAnimation() {
    Animated.timing(this.state.presentAnimation, {
      toValue: 1,
      duration: 500,
      delay: 0,
      useNativeDriver: true
    }).start(() => {
      setTimeout(() => {
        if (this.state.showNotification) {
          this.setState({ showNotification: !this.state.showNotification }, () => {
            this.setState({ message: "" })
          });
        }
      }, notificationDuration);
    })
  }

  componentWillReceiveProps(newProps) {
    this.setState({ loading: newProps.isLoading })
    if (newProps.success && this.state.showNotification == false) {
      if (newProps.success.data.status == 'failure' && newProps.success.data.message != '') {
        this.setState({ status: newProps.success.data.status, message: newProps.success.data.message, showNotification: true, loading: newProps.isLoading }, () => {
          this.startAnimation()
        })
      }
      else if (newProps.success.data.status == 'success' && newProps.success.data.message != '') {
        if (this.state.mode == 'edit') {
          Analytics.logEvent(CONSTANTS.FIREBASE_ANALYTICS.EDIT_ALERT, { "platform": Platform.OS, "userId": global.userID })

          this.setState({ status: newProps.success.data.status, message: newProps.success.data.message, showNotification: true, loading: newProps.isLoading }, () => {
            this.startAnimation()
          })
          this.props.navigation.state.params.updateAlertName(this.state.alertName)
          setTimeout(() => { this.backPress() }, notificationDuration)
        }
        else {
          this.setState({ status: newProps.success.data.status, message: newProps.success.data.message, showNotification: true, loading: newProps.isLoading }, () => {
            this.startAnimation()
          })
          setTimeout(() => { this.backPress() }, notificationDuration)
        }
      }
    }
    if (newProps.error != null) {
      alert(newProps.error.error)
    }
  }

  parseData(preferencesDataSource) {
    this.setState({ categoriesSelectedArray: preferencesDataSource.find(o => o.title === CONSTANTS.PRODUCT_CATEGORY) }, () => {

      let isSelectedArray = []

      this.state.categoriesSelectedArray.member.map(item => {
        if (item.isSelected != null && item.isSelected == true) {
          isSelectedArray.push(item)
        }
      })
    
      if ((isSelectedArray.length == 1 && isSelectedArray[0].isSelected )|| (isSelectedArray.length > 1) || (isSelectedArray.length == 0)) {
//      if ((isSelectedArray.length == 1 && isSelectedArray[0].isSelected && isSelectedArray[0].title != CONSTANTS.DRUGS_AND_BIO) || (isSelectedArray.length > 1) || (isSelectedArray.length == 0)) {
        var newTopicsArray = preferencesDataSource.find(o => o.title === CONSTANTS.TOPIC)
        var existingTopicsArray = this.state.regionsSelectedArray;
        let existingArrayCanBeLooped = (existingTopicsArray != undefined && existingTopicsArray.member && existingTopicsArray.member.length > 0)
        let newArrayCanBeLooped = (newTopicsArray != undefined && newTopicsArray.member && newTopicsArray.member.length > 0)
        if (existingArrayCanBeLooped && newArrayCanBeLooped) {
          newTopicsArray.member.map(topic => {
            var existingObject = existingTopicsArray.member.find(object => {
              return (object.title == topic.title)
            })
            if (existingObject != undefined) {
              topic.isSelected = existingObject.isSelected;
            }
          })
        }
        this.setState({ topicSelectedArray: newTopicsArray })
      }
      else {
        this.setState({ topicSelectedArray: [] })
      }
    })

    // find and mark selections from previous selections
    var newCountriesArray = preferencesDataSource.find(o => (o.title === CONSTANTS.COUNTRY_REGION || o.title === CONSTANTS.COUNTRY_REGION_DB || o.title === CONSTANTS.COUNTRY_REGION_MD))
    var existingCountriesArray = this.state.regionsSelectedArray;
    if (existingCountriesArray != undefined && existingCountriesArray.member && existingCountriesArray.member.length > 0) {
      newCountriesArray.member.map(country => {
        var existingObject = existingCountriesArray.member.find(object => {
          return (object.title == country.title)
        })
        if (existingObject != undefined) {
          country.isSelected = existingObject.isSelected;
        }
      })
    }
    this.setState({
      regionsSelectedArray: newCountriesArray
    })

    // find and mark selections from previous selections
    var newDocmentCategoryArray = preferencesDataSource.find(o => o.title === CONSTANTS.DOCUMENT_CATEGORY)
    var existingDocmentCategoryArray = this.state.doc_typesSelectedArray;
    if (existingDocmentCategoryArray != undefined && existingDocmentCategoryArray.member && existingDocmentCategoryArray.member.length > 0) {
      newDocmentCategoryArray.member.map(documentCategory => {
        var existingObject = existingDocmentCategoryArray.member.find(object => {
          return (object.title == documentCategory.title)
        })
        if (existingObject != undefined) {
          documentCategory.isSelected = existingObject.isSelected;
        }
      })
    }
    this.setState({ doc_categoriesSelectedArray: newDocmentCategoryArray })

    // find and mark selections from previous selections
    var newDocmentTypesArray = preferencesDataSource.find(o => (o.title === CONSTANTS.DOCUMENT_TYPE || o.title === CONSTANTS.DOCUMENT_TYPE_DB || o.title === CONSTANTS.DOCUMENT_TYPE_MD))
    var existingDocmentTypesArray = this.state.doc_typesSelectedArray;
    if (existingDocmentTypesArray != undefined && existingDocmentTypesArray.member && existingDocmentTypesArray.member.length > 0) {
      newDocmentTypesArray.member.map(documentType => {
        var existingObject = existingDocmentTypesArray.member.find(object => {
          return (object.title == documentType.title)
        })
        if (existingObject != undefined) {
          documentType.isSelected = existingObject.isSelected;
        }
      })
    }
    this.setState({ doc_typesSelectedArray: newDocmentTypesArray })

    if (this.state.preferencesDataToShow.length == 0) {
      preferencesSlicedDataToShow = preferencesDataSource.reduce((r, s) => {
        if (this.state.mode == 'edit' && r.filter(data => (data.title == CONSTANTS.NAME)).length == 0)
          r.push({ title: CONSTANTS.NAME, data: ['enter name of your alert'] });

        if (s.title == CONSTANTS.PRODUCT_CATEGORY || s.title == CONSTANTS.DOCUMENT_CATEGORY) {
          var selectedData = s.member
          // var selectedList = s.member.filter(o => o.isSelected === true)
          // var unselectedList = s.member.filter(o => o.isSelected != true)
          // var selectedData = [...selectedList, ...unselectedList];
        }
        else {
          var selectedData = s.member.filter(o => o.isSelected === true)
          if (selectedData.length > 0) {
            selectedData = selectedData
          }
          else {
            selectedData = s.member.slice(0, 3)
          }
        }


        r.push({ title: s.title, data: selectedData });

        return r;
      }, []);

      if (this.state.mode != 'edit')
        preferencesSlicedDataToShow.push({ title: CONSTANTS.NAME, data: ['enter name of your alert'] });

      this.setState({
        preferencesDataToShow: preferencesSlicedDataToShow
      }, () => {
        let drugNBioIsSelected = false
        this.state.preferencesDataSource.map(item => {
          if (item.title == CONSTANTS.PRODUCT_CATEGORY) {
            item.member.map(internalItem => {
              if (internalItem.title == CONSTANTS.DRUGS_AND_BIO && internalItem.isSelected) {
                drugNBioIsSelected = internalItem.isSelected
              }
              else {
                if (drugNBioIsSelected && internalItem.title == CONSTANTS.MEDICAL && !internalItem.isSelected) {
                 // this.setState({ isDBSelected: true })
                }
              }
            })
          }
        })
      })
    } else {
      var newSelectedRegion = []
      var newSelectedType = []
      var newSelectedTopic = []

      //handling dbSelected in first case
      if (this.state.preferencesDataToShow.findIndex(o => o.title === CONSTANTS.TOPIC) != -1) {

        if (preferencesDataSource.find(o => o.title === CONSTANTS.TOPIC)) {
          var updatedTopicSelection = preferencesDataSource.find(o => (o.title === CONSTANTS.TOPIC))
          if (updatedTopicSelection != undefined) {
            var existingTopicSelectionArray = this.state.preferencesDataToShow.find(o => (o.title === CONSTANTS.TOPIC));
            if (existingTopicSelectionArray != undefined && existingTopicSelectionArray.data && existingTopicSelectionArray.data.length > 0) {
              existingTopicSelectionArray.data.map(topic => {
                var existingObject = updatedTopicSelection.member.find(object => {
                  return (topic.title == object.title)
                })
                if (existingObject != undefined) {
                  topic.isSelected = existingObject.isSelected;
                }

              })


              updatedTopicSelection.member.map(object => existingTopicSelectionArray.data.map(topic => {
                let itemExists = existingTopicSelectionArray.data.filter(data => (data.title == object.title));
                if (topic.title != object.title && object.isSelected && itemExists.length == 0) {
                  var checkDuplicate = newSelectedTopic.filter(data => (data.title == object.title))
                  if (checkDuplicate.length == 0) {
                    newSelectedTopic.push(object)
                  }
                }
              }))
            }
          }

          if (newSelectedTopic.length > 0) {
            newSelectedTopic.map(newObject => {
              existingTopicSelectionArray.data.push(newObject);
            })
          }

        }
      } else {
        //handling dbSelection initially
        if (preferencesDataSource.findIndex(o => o.title === CONSTANTS.TOPIC) != -1) {
          var topics = preferencesDataSource.find(o => o.title === CONSTANTS.TOPIC) ? preferencesDataSource.find(o => o.title === CONSTANTS.TOPIC).member : []

          var selectedData = topics.filter(data => (data.isSelected == true));

          if (selectedData.length > 0) {
            selectedData = selectedData
          }
          else {
            selectedData = topics.slice(0, 3)
          }

          var topicObject = { title: CONSTANTS.TOPIC, data: selectedData }

          var tempDataToShow = this.state.preferencesDataToShow
          tempDataToShow.splice(1, 0, topicObject);

          this.setState({
            preferencesDataToShow: tempDataToShow
          })
        }
      }


      var updatedRegionSelection = preferencesDataSource.find(o => (o.title === CONSTANTS.COUNTRY_REGION || o.title === CONSTANTS.COUNTRY_REGION_DB || o.title === CONSTANTS.COUNTRY_REGION_MD))
      var existingRegionSelectionArray = this.state.preferencesDataToShow.find(o => (o.title === CONSTANTS.COUNTRY_REGION || o.title === CONSTANTS.COUNTRY_REGION_DB || o.title === CONSTANTS.COUNTRY_REGION_MD));
      if (existingRegionSelectionArray != undefined && existingRegionSelectionArray.data && existingRegionSelectionArray.data.length > 0) {
        existingRegionSelectionArray.data.map(region => {
          var existingObject = updatedRegionSelection.member.find(object => {
            return (region.title == object.title)
          })
          if (existingObject != undefined) {
            region.isSelected = existingObject.isSelected;
          }
        })

        updatedRegionSelection.member.map(object => existingRegionSelectionArray.data.map(topic => {
          let itemExists = existingRegionSelectionArray.data.filter(data => (data.title == object.title));
          if (topic.title != object.title && object.isSelected && itemExists.length == 0) {
            var checkDuplicate = newSelectedRegion.filter(data => (data.title == object.title))
            if (checkDuplicate.length == 0) {
              newSelectedRegion.push(object)
            }
          }
        }))

        if (newSelectedRegion.length > 0) {
          newSelectedRegion.map(newObject => {
            existingRegionSelectionArray.data.push(newObject);
          })
        }

      }



      var updatedTypeSelection = preferencesDataSource.find(o => (o.title === CONSTANTS.DOCUMENT_TYPE || o.title === CONSTANTS.DOCUMENT_TYPE_DB || o.title === CONSTANTS.DOCUMENT_TYPE_MD))
      var existingTypeSelectionArray = this.state.preferencesDataToShow.find(o => (o.title === CONSTANTS.DOCUMENT_TYPE || o.title === CONSTANTS.DOCUMENT_TYPE_DB || o.title === CONSTANTS.DOCUMENT_TYPE_MD));
      if (existingTypeSelectionArray != undefined && existingTypeSelectionArray.data && existingTypeSelectionArray.data.length > 0) {
        existingTypeSelectionArray.data.map(type => {
          var existingObject = updatedTypeSelection.member.find(object => {
            return (type.title == object.title)
          })
          if (existingObject != undefined) {
            type.isSelected = existingObject.isSelected;
          }
        })

        updatedTypeSelection.member.map(object => existingTypeSelectionArray.data.map(topic => {
          let itemExists = existingTypeSelectionArray.data.filter(data => (data.title == object.title));
          if (topic.title != object.title && object.isSelected && itemExists.length == 0) {
            var checkDuplicate = newSelectedType.filter(data => (data.title == object.title))
            if (checkDuplicate.length == 0) {
              newSelectedType.push(object)
            }
          }
        }))

        if (newSelectedType.length > 0) {
          newSelectedType.map(newObject => {
            existingTypeSelectionArray.data.push(newObject);
          })
        }
      }

      var localPreferencesDataToShow = this.state.preferencesDataToShow

      var index = localPreferencesDataToShow.findIndex(o => (o.title === CONSTANTS.TOPIC))
      if (index != -1 && existingTopicSelectionArray != undefined) {
        localPreferencesDataToShow[index].data = existingTopicSelectionArray.data
      }
      index = localPreferencesDataToShow.findIndex(o => (o.title === CONSTANTS.COUNTRY_REGION || o.title === CONSTANTS.COUNTRY_REGION_DB || o.title === CONSTANTS.COUNTRY_REGION_MD))
      if (index != -1)
        localPreferencesDataToShow[index].data = existingRegionSelectionArray.data


      index = localPreferencesDataToShow.findIndex(o => (o.title === CONSTANTS.DOCUMENT_TYPE || o.title === CONSTANTS.DOCUMENT_TYPE_DB || o.title === CONSTANTS.DOCUMENT_TYPE_MD))
      if (index != -1)
        localPreferencesDataToShow[index].data = existingTypeSelectionArray.data



      this.setState({ preferencesDataToShow: localPreferencesDataToShow })
    }
  }



  manageNewSelectionData = (existingData, updatedData) => {

  }

  parentViewForIos = () => {
    var action = CONSTANTS.ADD

    let bottomBarTranslateY = this.state.presentAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [-100, 0]
    })
    return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <Animated.View accessible={false} style={{ position: 'absolute', width: '100%', zIndex: 2, transform: [{ translateY: bottomBarTranslateY }] }}>
          {this.state.showNotification != "" && <NotificationAlertView BGColor={this.state.status == 'success' ? COLOR.GREEN_SUCCESS : COLOR.PINK} titleviewstyle={[styles.titleviewstyle, { backgroundColor: this.state.status == 'success' ? COLOR.GREEN_SUCCESS : COLOR.PINK }]} headerstyle={styles.headerstyle} title={this.state.message}></NotificationAlertView>}
        </Animated.View>
        <SafeAreaView style={styles.SafeAreaViewTop} >
          <NavigationHeader showActionButton={true} title={this.state.mode ? (this.state.mode == 'edit' ? CONSTANTS.EDIT_ALERT : CONSTANTS.CREATE_ALERT) : CONSTANTS.CREATE_ALERT} action={action} backAction={this.backPress} actionPress={() => this.addPress()} back={true}></NavigationHeader>
        </SafeAreaView>
        <View style={{ flex: 1, backgroundColor: COLOR.WHITE }}>
          <SectionList
            sections={this.state.preferencesDataToShow}
            extraData={this.state.preferencesDataToShow}
            ListFooterComponent={this.renderFooter()}
            renderItem={({ item, section, index }) => this.renderItem({ item, section, index })}
            renderSectionHeader={({ section }) => this.renderSectionHeaderComponent({ section })}
          />
        </View>
        {this.state.loading &&
          (<View style={styles.loading}>
            <ActivityIndicator color="grey" size="large" />
          </View>)}
      </KeyboardAvoidingView>
    )
  }
  parentViewForAndroid = () => {
    var action = CONSTANTS.ADD

    let bottomBarTranslateY = this.state.presentAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [-100, 0]
    })
    return (
      <View style={{ flex: 1 }}>
        <Animated.View accessible={false} style={{ position: 'absolute', width: '100%', zIndex: 2, transform: [{ translateY: bottomBarTranslateY }] }}>
          {this.state.showNotification != "" && <NotificationAlertView BGColor={this.state.status == 'success' ? COLOR.GREEN_SUCCESS : COLOR.PINK} titleviewstyle={[styles.titleviewstyle, { backgroundColor: this.state.status == 'success' ? COLOR.GREEN_SUCCESS : COLOR.PINK }]} headerstyle={styles.headerstyle} title={this.state.message}></NotificationAlertView>}
        </Animated.View>
        <SafeAreaView style={styles.SafeAreaViewTop} >
          <NavigationHeader showActionButton={true} title={this.state.mode ? (this.state.mode == 'edit' ? CONSTANTS.EDIT_ALERT : CONSTANTS.CREATE_ALERT) : CONSTANTS.CREATE_ALERT} action={action} backAction={this.backPress} actionPress={() => this.addPress()} back={true}></NavigationHeader>
        </SafeAreaView>
        <View style={{ flex: 1, backgroundColor: COLOR.WHITE }}>
          <SectionList
            sections={this.state.preferencesDataToShow}
            extraData={this.state.preferencesDataToShow}
            ListFooterComponent={this.renderFooter()}
            renderItem={({ item, section, index }) => this.renderItem({ item, section, index })}
            renderSectionHeader={({ section }) => this.renderSectionHeaderComponent({ section })}
          />
        </View>
        {this.state.loading &&
          (<View style={styles.loading}>
            <ActivityIndicator color="grey" size="large" />
          </View>)}
      </View>
    )
  }
  renderFooter = () => {
    return (
      <View style={{width:'100%',height:Platform.OS === 'ios' ? NormalizeLayout(11) : 0}}>
      </View>
    );
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        {(Platform.OS == 'ios') ?
          (this.parentViewForIos()) : (this.parentViewForAndroid())
        }
        {(this.state.explicitlyShowOfflineNotification) && (
          <NotificationNotice status={'Fail'} displayText={CONSTANTS.NO_INTERNET} />
        )}
        <OfflineNotice ConnectionStatus={this.props.isConnected} />
      </View>
    )
  }

  backPress = () => {
    this.props.navigation.goBack()
  }

  addPress = () => {
    if (this.state.preferencesDataSource && this.state.preferencesDataSource.length > 0) {
      AsyncStorage.getItem('userToken', (err, result) => {
        if (err) {
        } else {
          if (result == null) {

          } else {
            let categories = []
            let doc_categories = []
            let doc_types = []
            let topic = []
            let regions = []

            this.state.categoriesSelectedArray.member.map(item => {
              CONSTANTS.PRODUCT_CATEGORY
              if (item.isSelected && item.isSelected == true) {
                categories.push(item.title)
              }
            })

            if (!this.isDualUser() && this.state.categoriesSelectedArray.member.length == 1 && categories.length == 0) {
              categories.push(this.state.categoriesSelectedArray.member[0].title)
            }
            if (this.state.preferencesDataSource.find(o => o.title === CONSTANTS.DOCUMENT_CATEGORY)) {
              this.state.preferencesDataSource.find(o => o.title === CONSTANTS.DOCUMENT_CATEGORY).member.map(item => {
                if (item.isSelected && item.isSelected == true) {
                  doc_categories.push(item.title)
                }
              })
            }

            if (this.state.preferencesDataSource.find(o => (o.title === CONSTANTS.DOCUMENT_TYPE || o.title === CONSTANTS.DOCUMENT_TYPE_DB || o.title === CONSTANTS.DOCUMENT_TYPE_MD))) {
              this.state.preferencesDataSource.find(o => (o.title === CONSTANTS.DOCUMENT_TYPE || o.title === CONSTANTS.DOCUMENT_TYPE_DB || o.title === CONSTANTS.DOCUMENT_TYPE_MD)).member.map(item => {
                if (item.isSelected && item.isSelected == true) {
                  let title = item.title.toString().replace('&','%26')
                  doc_types.push(title)
                }
              })
            }
            if (this.state.preferencesDataSource.find(o => o.title === CONSTANTS.TOPIC)) {
              this.state.preferencesDataSource.find(o => o.title === CONSTANTS.TOPIC).member.map(item => {
                if (item.isSelected && item.isSelected == true) {
                  topic.push(item.title)
                }
              })
            }

            if (this.state.preferencesDataSource.find(o => {
              return (o.title === CONSTANTS.COUNTRY_REGION || o.title === CONSTANTS.COUNTRY_REGION_DB || o.title === CONSTANTS.COUNTRY_REGION_MD)
            })) {
              this.state.preferencesDataSource.find(o => {
                return (o.title === CONSTANTS.COUNTRY_REGION || o.title === CONSTANTS.COUNTRY_REGION_DB || o.title === CONSTANTS.COUNTRY_REGION_MD)
              }).member.map(item => {
                if (item.isSelected && item.isSelected == true) {
                  if (item.countryId) {
                    regions.push(item.countryId)
                  }
                  else {
                    if (getCountryCode(item.title) != '') {
                      regions.push(getCountryCode(item.title))
                    }
                  }
                }
              })
            }

            if (this.state.preferencesDataSource.find(o => {
              return (o.title === CONSTANTS.COUNTRY_REGION || o.title === CONSTANTS.COUNTRY_REGION_DB || o.title === CONSTANTS.COUNTRY_REGION_MD)
            })) {
              if (regions.length == 0) {
                this.state.preferencesDataSource.find(o => {
                  return (o.title === CONSTANTS.COUNTRY_REGION || o.title === CONSTANTS.COUNTRY_REGION_DB || o.title === CONSTANTS.COUNTRY_REGION_MD)
                }).member.map(item => {
                  if (item.countryId) {
                    regions.push(item.countryId)
                  }
                  else {
                    if (getCountryCode(item.title) != '') {
                      regions.push(getCountryCode(item.title))
                    }
                  }
                })
              }
            }

            if (this.state.preferencesDataSource.find(o => {
              return (o.title === CONSTANTS.DOCUMENT_TYPE || o.title === CONSTANTS.DOCUMENT_TYPE_DB || o.title === CONSTANTS.DOCUMENT_TYPE_MD)
            })) {
              if (doc_types.length == 0) {
                this.state.preferencesDataSource.find(o => {
                  return (o.title === CONSTANTS.DOCUMENT_TYPE || o.title === CONSTANTS.DOCUMENT_TYPE_DB || o.title === CONSTANTS.DOCUMENT_TYPE_MD)
                }).member.map(item => {
                  let title = item.title.toString().replace('&','%26')
                  doc_types.push(title)
                  
                })
              }
            }


            /*if (this.state.isDBSelected) {
              if (doc_categories.length == 0) {
                  var createAlertString = "productCategory=" + categories.toString() + "&region=" + regions.toString() + "&documentType=" + doc_types.toString() + "&frequency=DAILY&alertName=" + this.state.alertName
                  var updateAlertString = "alertId=" + this.state.alertId + "&productCategory=" + categories.toString() + "&region=" + regions.toString() + "&documentType=" + doc_types.toString() + "&frequency=DAILY&alertName=" + this.state.alertName
              } else {
                  var createAlertString = "productCategory=" + categories.toString() + "&region=" + regions.toString() + "&documentCategory=" + doc_categories.toString() + "&documentType=" + doc_types.toString() + "&frequency=DAILY&alertName=" + this.state.alertName
                  var updateAlertString = "alertId=" + this.state.alertId + "&productCategory=" + categories.toString() + "&region=" + regions.toString() + "&documentCategory=" + doc_categories.toString() + "&documentType=" + doc_types.toString() + "&frequency=DAILY&alertName=" + this.state.alertName
              }
            } 
            else {*/
              if (topic.length == 0) {
                if (doc_categories.length == 0) {              
                    var createAlertString = "productCategory=" + categories.toString() + "&region=" + regions.toString() + "&documentType=" + doc_types.toString() + "&frequency=DAILY&alertName=" + this.state.alertName
                    var updateAlertString = "alertId=" + this.state.alertId + "&productCategory=" + categories.toString() + "&region=" + regions.toString() + "&documentType=" + doc_types.toString() + "&frequency=DAILY&alertName=" + this.state.alertName
                } else {
                    var createAlertString = "productCategory=" + categories.toString() + "&region=" + regions.toString() + "&documentCategory=" + doc_categories.toString() + "&documentType=" + doc_types.toString() + "&frequency=DAILY&alertName=" + this.state.alertName
                    var updateAlertString = "alertId=" + this.state.alertId + "&productCategory=" + categories.toString() + "&region=" + regions.toString() + "&documentCategory=" + doc_categories.toString() + "&documentType=" + doc_types.toString() + "&frequency=DAILY&alertName=" + this.state.alertName
                }
              } else {
                if (doc_categories.length == 0) {
                    var createAlertString = "productCategory=" + categories.toString() + "&topic=" + topic.toString() + "&region=" + regions.toString() + "&documentType=" + doc_types.toString() + "&frequency=DAILY&alertName=" + this.state.alertName
                    var updateAlertString = "alertId=" + this.state.alertId + "&productCategory=" + categories.toString() + "&topic=" + topic.toString() + "&region=" + regions.toString() + "&documentType=" + doc_types.toString() + "&frequency=DAILY&alertName=" + this.state.alertName
                } else {
                    var createAlertString = "productCategory=" + categories.toString() + "&topic=" + topic.toString() + "&region=" + regions.toString() + "&documentCategory=" + doc_categories.toString() + "&documentType=" + doc_types.toString() + "&frequency=DAILY&alertName=" + this.state.alertName
                    var updateAlertString = "alertId=" + this.state.alertId + "&productCategory=" + categories.toString() + "&topic=" + topic.toString() + "&region=" + regions.toString() + "&documentCategory=" + doc_categories.toString() + "&documentType=" + doc_types.toString() + "&frequency=DAILY&alertName=" + this.state.alertName
                }
              }
            // }

            if (this.props.isConnected) {
              if (this.state.mode == 'edit')
                this.props.updateAlert(result, updateAlertString, this.state.alertId, this.state.alertName, global.userID)
              else {
                Analytics.logEvent(CONSTANTS.FIREBASE_ANALYTICS.CREATE_ALERT, { "platform": Platform.OS, "userId": global.userID, "changedSelections": changedSelectionsForAnalytics.toString(), "numberOfDefaultSelectionsChanged": changedSelectionsForAnalytics.length })
                this.props.createAlert(result, createAlertString)
              }
            }
            else {
              this.setState({ explicitlyShowOfflineNotification: true }, () => {
                setTimeout(() => {
                  this.setState({ explicitlyShowOfflineNotification: false })
                }, notificationDuration);
              })
            }
          }
        }
      })
    }
  }

  // renderItemComponent = ({ item, section, index }) => {
  //   if (this.state.isDBSelected && section.title == CONSTANTS.TOPIC) {
  //     return null
  //   }
  //   else {
  //     return (
  //       this.renderItem({ item, section, index })
  //     )
  //   }
  // }
  

  showInitialText = () => {
    if (this.state.mode == 'edit') {
      if (this.state.alertName != '') {
        return this.state.alertName
      } else {
        if (this.state.userUpdatedAlertName) {
          return this.state.alertName
        } 
        // else if (this.state.isDBSelected) {
        //   this.state.alertName = ''
        //   return ''
        // }
         else {
          if (this.state.topicSelectedArray && this.state.topicSelectedArray.member && this.state.topicSelectedArray.member.length > 0) {
            let isSelectedArray = []

            this.state.topicSelectedArray.member.map(item => {
              if (item.isSelected != null && item.isSelected == true) {
                isSelectedArray.push(item)
              }
            })
            if (isSelectedArray.length == 1 && isSelectedArray[0].isSelected) {
              if (this.state.alertName !== isSelectedArray[0].title) {
                this.state.alertName = isSelectedArray[0].title
                return isSelectedArray[0].title
              }
            }
            else if (isSelectedArray.length > 1) {
              this.state.alertName = ''
              return ''
            }
          }
        }
      }
    } else {
      if (this.state.alertName != '') {
        if (this.state.userUpdatedAlertName) {
          return this.state.alertName
        } 
        // else if (this.state.isDBSelected) {
        //   this.state.alertName = ''
        //   return ''
        // }
         else {
          if (this.state.topicSelectedArray && this.state.topicSelectedArray.member && this.state.topicSelectedArray.member.length > 0) {
            let isSelectedArray = []

            this.state.topicSelectedArray.member.map(item => {
              if (item.isSelected != null && item.isSelected == true) {
                isSelectedArray.push(item)
              }
            })
            if (isSelectedArray.length == 1 && isSelectedArray[0].isSelected) {
              if (this.state.alertName !== isSelectedArray[0].title) {
                this.state.alertName = isSelectedArray[0].title
                return isSelectedArray[0].title
              }
            }
            else if (isSelectedArray.length > 1 || isSelectedArray.length == 0) {
              this.state.alertName = ''
              return ''
            }
          }
        }
      } else {
        if (this.state.userUpdatedAlertName) {
          return this.state.alertName
        }
        //  else if (this.state.isDBSelected) {
        //   this.state.alertName = ''
        //   return ''
        // }
        //  else {
          if (this.state.topicSelectedArray && this.state.topicSelectedArray.member && this.state.topicSelectedArray.member.length > 0) {
            let isSelectedArray = []

            this.state.topicSelectedArray.member.map(item => {
              if (item.isSelected != null && item.isSelected == true) {
                isSelectedArray.push(item)
              }
            })

            if (isSelectedArray.length == 1 && isSelectedArray[0].isSelected) {
              if (this.state.alertName == '') {
                this.state.alertName = isSelectedArray[0].title
                return isSelectedArray[0].title
              } else {
                if (this.state.alertName !== isSelectedArray[0].title) {
                  if (this.state.userUpdatedAlertName) {
                    return this.state.alertName
                  } else {
                    this.state.alertName = isSelectedArray[0].title
                    return isSelectedArray[0].title
                  }
                } else {
                  this.state.alertName = isSelectedArray[0].title
                  return isSelectedArray[0].title
                // }
              }
            }
          }
        }
      }
    }
  }


  renderItem = ({ item, section, index }) => {
    // if (this.state.isDBSelected && section.title == CONSTANTS.TOPIC) {
    //   return null
    // }
    // else {
      switch (section.title) {

        case CONSTANTS.PRODUCT_CATEGORY:
          return (
            <CheckBoxListRow
              text={item.title}
              readOnly={(this.state.mode == 'edit')}
              isDualUser={this.isDualUser()}
              isChecked={!this.isDualUser() ? true : (item.isSelected ? item.isSelected : false)}
              onChecked={(isChecked) => { this.state.mode != 'edit' && this.onCheckedTrue(item, isChecked) }} />
          )
          break;
        case CONSTANTS.TOPIC:
          return (
            <View>
              <SwitchListRow
                text={item.title}
                value={item.isSelected}
                mode={this.state.mode}
                onToggleRemember={(value) => { this.toggleRememberTopic(item, value) }}>
              </SwitchListRow>

              {(index == (section.data.length - 1)) &&
                <MoreListRow
                  title={CONSTANTS.MORE_TOPICS}
                  mode={this.state.mode}
                  onMorePress={() => this.redirectToSearchMore(this.state.preferencesDataToShow.find((o => o.title === CONSTANTS.TOPIC)),
                    this.state.preferencesDataSource.find((o => o.title === CONSTANTS.TOPIC)), CONSTANTS.MORE_TOPICS)}>
                </MoreListRow>
              }
            </View>
          )
          break;
        case CONSTANTS.COUNTRY_REGION_MD:
        case CONSTANTS.COUNTRY_REGION_DB:
        case CONSTANTS.COUNTRY_REGION:
          return (
            <View>
              <SwitchListRow
                text={item.title}
                value={item.isSelected}
                mode={this.state.mode}
                onToggleRemember={(value) => { this.toggleRememberRegion(item, value) }}>
              </SwitchListRow>
              {(index == (section.data.length - 1)) &&
                <MoreListRow
                  title={CONSTANTS.MORE_REGIONS}
                  mode={this.state.mode}
                  onMorePress={() => {
                    this.redirectToSearchMore(this.state.preferencesDataToShow.find(o => o.title === CONSTANTS.COUNTRY_REGION || o.title == CONSTANTS.COUNTRY_REGION_DB || o.title == CONSTANTS.COUNTRY_REGION_MD),
                      this.state.preferencesDataSource.find(o => {
                        return (o.title == CONSTANTS.COUNTRY_REGION || o.title == CONSTANTS.COUNTRY_REGION_DB || o.title == CONSTANTS.COUNTRY_REGION_MD)
                      })
                      , CONSTANTS.MORE_REGIONS)
                  }}>
                </MoreListRow>
              }
            </View>
          )
          break;

        case CONSTANTS.DOCUMENT_CATEGORY:
          return (
            <View>
              <SwitchListRow text={item.title}
                value={item.isSelected}
                mode={this.state.mode}
                onToggleRemember={(value) => { this.toggleRememberDocCategories(item, value) }}
              >
              </SwitchListRow>
            </View>
          )
          break;
        case CONSTANTS.DOCUMENT_TYPE_DB:
        case CONSTANTS.DOCUMENT_TYPE_MD:
        case CONSTANTS.DOCUMENT_TYPE:
          // if (index < 3) {
          return (
            <View>
              <SwitchListRow
                text={item.title}
                value={item.isSelected}
                mode={this.state.mode}
                onToggleRemember={(value) => { this.toggleRememberTypes(item, value) }}
              >
              </SwitchListRow>
              {(index == (section.data.length - 1)) &&
                <MoreListRow
                  title={CONSTANTS.MORE_TYPES}
                  mode={this.state.mode}
                  onMorePress={() => this.redirectToSearchMore(this.state.preferencesDataToShow.find(o => o.title === CONSTANTS.DOCUMENT_TYPE || o.title === CONSTANTS.DOCUMENT_TYPE_DB || o.title === CONSTANTS.DOCUMENT_TYPE_MD),
                    this.state.preferencesDataSource.find((o => (o.title === CONSTANTS.DOCUMENT_TYPE || o.title === CONSTANTS.DOCUMENT_TYPE_DB || o.title === CONSTANTS.DOCUMENT_TYPE_MD))), CONSTANTS.MORE_TYPES)}>
                </MoreListRow>}
            </View>
          )
          break;
        case CONSTANTS.NAME:
          return (
              <InputSelection
                inputTextstyle={styles.inputView}
                inputLayout={styles.inputLayout}
                sepView={styles.sepView}
                mode={this.state.mode}
                text={this.state.alertName}
                icon={<SvgPencil />}
                placeholder={this.showInitialText()}
                onChangeText={(text) => {
                  if (text != undefined)
                    this.changeTopic(text)
                }}
              />
            
          )
          break;
        default:
          return (
            <View>
              <SwitchListRow
                text={item.title}
                value={item.isSelected}
                mode={this.state.mode}
                onToggleRemember={(value) => { this.toggleRememberTypes(item, value) }}
              >
              </SwitchListRow>
              {(index == (section.data.length - 1)) &&
                <MoreListRow
                  title={CONSTANTS.MORE_TYPES}
                  mode={this.state.mode}
                  onMorePress={() => this.redirectToSearchMore(this.state.preferencesDataSource.find((o => o.title === CONSTANTS.DOCUMENT_TYPE)), CONSTANTS.MORE_TYPES)}>
                </MoreListRow>}
            </View>
          )
          break;
      // }
    }
  }

  isDualUser() {
    return (this.state.categoriesSelectedArray && this.state.categoriesSelectedArray.member && this.state.categoriesSelectedArray.member.length > 1)
  }

  onCheckedTrue = (item, isChecked) => {
    let isDBSelected = false
    let isMDSelected = false
    var updatedObject = { title: item.title, isSelected: isChecked }
    var index = this.state.categoriesSelectedArray.member.findIndex(object => object.title === item.title)
    this.state.categoriesSelectedArray.member.splice(index, 1);
    this.state.categoriesSelectedArray.member.splice(index, 0, updatedObject);

    var array = this.state.preferencesDataSource
    var position = array.findIndex(object => object.title === CONSTANTS.PRODUCT_CATEGORY)
    array[position] = this.state.categoriesSelectedArray

    this.state.categoriesSelectedArray.member.map(item => {
      if (item.title == CONSTANTS.DRUGS_AND_BIO && item.isSelected) {
        isDBSelected = true
      }
      else if (isDBSelected && item.title == CONSTANTS.MEDICAL && !item.isSelected) {
        isDBSelected = true
      }
      else if (item.title == CONSTANTS.MEDICAL && item.isSelected) {
        isMDSelected = true
      }
    })

    if (isDBSelected && !isMDSelected) {
      //this.setState({ isDBSelected: true })
    }
    else {
      //this.setState({ isDBSelected: false })
    }
    let userPreferenceModel = this.state.userPreferenceModel
    let optionsToDisplay = userPreferenceModel.getOptionsForDisplayOnCreateAlert(isDBSelected, isMDSelected)
    this.setState({ preferencesDataSource: optionsToDisplay })
    this.parseData(optionsToDisplay)
  }

  toggleRememberRegion = (item, isSelected) => {
    var updatedObject = { title: item.title, isSelected: isSelected, countryId: item.countryId }
    var index = this.state.regionsSelectedArray.member.findIndex(object => object.title === item.title)
    this.state.regionsSelectedArray.member.splice(index, 1);
    this.state.regionsSelectedArray.member.splice(index, 0, updatedObject);

    var array = this.state.preferencesDataSource
    var position = array.findIndex(object => (object.title === CONSTANTS.COUNTRY_REGION || object.title === CONSTANTS.COUNTRY_REGION_DB || object.title === CONSTANTS.COUNTRY_REGION_MD))
    array[position] = this.state.regionsSelectedArray
    this.setState({ preferencesDataSource: array })
    this.parseData(this.state.preferencesDataSource)
    changedSelectionsForAnalytics.push(item.title)

  }

  toggleRememberDocCategories = (item, isSelected) => {
    var updatedObject = { title: item.title, isSelected: isSelected }
    var index = this.state.doc_categoriesSelectedArray.member.findIndex(object => object.title === item.title)
    this.state.doc_categoriesSelectedArray.member.splice(index, 1);
    this.state.doc_categoriesSelectedArray.member.splice(index, 0, updatedObject);

    var array = this.state.preferencesDataSource
    var position = array.findIndex(object => object.title === CONSTANTS.DOCUMENT_CATEGORY)
    array[position] = this.state.doc_categoriesSelectedArray
    this.setState({ preferencesDataSource: array })
    this.parseData(this.state.preferencesDataSource)
    changedSelectionsForAnalytics.push(item.title)

  }
  toggleRememberTopic = (item, isSelected) => {

    var updatedObject = { title: item.title, isSelected: isSelected }

    var index = this.state.topicSelectedArray.member.findIndex(object => object.title === item.title)
    this.state.topicSelectedArray.member.splice(index, 1);
    this.state.topicSelectedArray.member.splice(index, 0, updatedObject);

    var array = this.state.preferencesDataSource
    var position = array.findIndex(object => object.title === CONSTANTS.TOPIC)
    array[position] = this.state.topicSelectedArray

    // var arrayToShow=this.state.preferencesDataToShow
    // arrayToShow[position] = this.state.topicSelectedArray
    this.setState({ preferencesDataSource: array })
    this.parseData(this.state.preferencesDataSource)
    changedSelectionsForAnalytics.push(item.title)

  }

  toggleRememberTypes = (item, isSelected) => {
    var updatedObject = { title: item.title, isSelected: isSelected }
    var index = this.state.doc_typesSelectedArray.member.findIndex(object => object.title === item.title)
    this.state.doc_typesSelectedArray.member.splice(index, 1);
    this.state.doc_typesSelectedArray.member.splice(index, 0, updatedObject);

    var array = this.state.preferencesDataSource
    var position = array.findIndex(object => (object.title === CONSTANTS.DOCUMENT_TYPE || object.title === CONSTANTS.DOCUMENT_TYPE_DB || object.title === CONSTANTS.DOCUMENT_TYPE_MD))
    array[position] = this.state.doc_typesSelectedArray
    this.setState({ preferencesDataSource: array })
    this.parseData(this.state.preferencesDataSource)
    changedSelectionsForAnalytics.push(item.title)

  }

  renderSectionHeaderComponent = ({ section }) => {
    if (section.title == "default" || section.title == CONSTANTS.MORE_REGIONS || section.title == CONSTANTS.MORE_TYPES || section.title == CONSTANTS.MORE_TOPICS)
      return null
    else {
      // if (this.state.isDBSelected && section.title == CONSTANTS.TOPIC) {
      //   return null
      // }
      // else {
        var headerTitle = section.title
        if (section.title == CONSTANTS.COUNTRY_REGION_DB || section.title == CONSTANTS.COUNTRY_REGION_MD) {
          headerTitle = CONSTANTS.COUNTRY_REGION
        }
        else if (section.title == CONSTANTS.DOCUMENT_TYPE_DB || section.title == CONSTANTS.DOCUMENT_TYPE_MD) {
          headerTitle = CONSTANTS.DOCUMENT_TYPE
        }
        return (
          <HeaderListRow title={headerTitle}></HeaderListRow>
        )
      // }
    }
  }

  getTopicString = (title) => {
    let spaceIndex = title.indexOf(' ')
    if (spaceIndex != -1) {
      title = title.substring(spaceIndex + 1, title.length)
    }
    return title
  }

  redirectToSearchMore = (localSectionToShow, section, title) => {
    if (section != undefined) {
      if (this.state.mode != 'edit') {
        this.props.navigation.navigate('SearchScreen', {
          SectionToShow: localSectionToShow,
          Sections: section,
          title: 'Select ' + this.getTopicString(title),
          onSearchData: (value, isSelected) => {
            switch (title) {
              case CONSTANTS.MORE_TOPICS:
                Analytics.logEvent(CONSTANTS.FIREBASE_ANALYTICS.SHOW_MORE_TOPICS, { "platform": Platform.OS, "userId": global.userID })
                this.toggleRememberTopic(value, isSelected)
                break;
              case CONSTANTS.MORE_REGIONS:
                Analytics.logEvent(CONSTANTS.FIREBASE_ANALYTICS.SHOW_MORE_REGIONS, { "platform": Platform.OS, "userId": global.userID })
                this.toggleRememberRegion(value, isSelected)
                break;
              case CONSTANTS.MORE_CATEGORIES:
                Analytics.logEvent(CONSTANTS.FIREBASE_ANALYTICS.SHOW_MORE_CATEGORIES, { "platform": Platform.OS, "userId": global.userID })
                this.toggleRememberDocCategories(value, isSelected)
                break;
              case CONSTANTS.MORE_TYPES:
                Analytics.logEvent(CONSTANTS.FIREBASE_ANALYTICS.SHOW_MORE_TYPES, { "platform": Platform.OS, "userId": global.userID })
                this.toggleRememberTypes(value, isSelected)
                break;
              default:
                break;
            }
          }
        });
      }
    }
  }
  changeTopic = (text) => {
    if (text != undefined) {
      this.setState({ alertName: text, userUpdatedAlertName: true })
    }
  }
}

const styles = StyleSheet.create({
  header: {
    color: COLOR.BLACK,
    marginLeft: NormalizeLayout(16),
    fontSize: Normalize(12),
    height: Normalize(15),
    fontSize: Normalize(12),
    fontWeight: 'bold',
  },
  sepview: {
    backgroundColor: COLOR.Gray_Sep,
    marginTop: NormalizeLayout(29),
    height: Normalize(2),
    width: '100%'
  },
  sectionview: {
    backgroundColor: COLOR.TAB_BG_COLOR,
    flexDirection: 'column',
    alignContent: 'center',
    justifyContent: 'space-around',
    height: NormalizeLayout(60)

  },
  inputView: {
    width: '85%',
    height: '100%',
    fontSize: Normalize(18),
    borderColor: COLOR.BLACK_TEXT,
    borderWidth: 0,
    fontFamily: fonts.SourceSansProRegular
  },

  inputLayout: {
    flexDirection: 'column',
    marginLeft: NormalizeLayout(24),
    marginRight: NormalizeLayout(24),
    marginTop: NormalizeLayout(20),

  },
  sepView: {
    height: NormalizeLayout(1),
    backgroundColor: COLOR.THEME_COLOR,
    marginBottom: NormalizeLayout(20)
  },
  SafeAreaViewTop: {
    backgroundColor: COLOR.HEADER_BG,

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
  isLoading: state.alertsData.loading,
  success: state.alertsData.success,
  preferencesData: state.preferencesData.preferences,
  error: state.alertsData.errorMessage,

});

const mapDispatchToProps = dispatch => ({
  createAlert: (result, appendedString) => dispatch(createAlert(result, appendedString)),
  updateAlert: (result, appendedString, alertId, updatedAlertName, userID) => dispatch(editAlert(result, appendedString, alertId, updatedAlertName, userID)),
});



export default connect(mapStateToProps, mapDispatchToProps)(CreateAlertScreen);