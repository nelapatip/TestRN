import React from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, Animated, Dimensions, Platform, Toast, ActivityIndicator, PermissionsAndroid, Alert, BackHandler } from 'react-native';
import { connect } from "react-redux";
import { COLOR } from '../../constants/Colors'
import { Normalize, NormalizeLayout } from '../../utils/Scale'
import { CONSTANTS } from '../../constants/Constants'
import RelatedView from './RelatedView'
import RNFetchBlob from 'rn-fetch-blob';
import RNFS from 'react-native-fs'
import  AsyncStorage  from "@react-native-community/async-storage";

import RNPrint from 'react-native-print';
// import Mailer from 'react-native-mail';
import SvgCalendar from '../../../assets/svgimage/Calendar'
import SvgStatus from '../../../assets/svgimage/Status'
import SvgRegion from '../../../assets/svgimage/Region'
import SvgIdrac from '../../../assets/svgimage/Idrac'
import BottomBar from '../../utils/BottomBar'
import SvgShare from '../../../assets/svgimage/Share'
import SvgStar from '../../../assets/svgimage/Star5'
import SvgFilledStar from '../../../assets/svgimage/filledStar'
import SvgRelated from '../../../assets/svgimage/Related'
import SvgVersion from '../../../assets/svgimage/Version'
import { BaseURL, EmailDocumentUrl } from '../../configurations/configurations'
import SvgLanguages from '../../../assets/svgimage/Languages'
import SvgSource from '../../../assets/svgimage/Source'

import fonts from '../../utils/CortellisFonts'
import ActionSheet from '../../utils/CustomActionSheet/ActionSheet'
import { getCitedDocuments, getCitedBy, getSnapShotObject, checkForFavDocument, getDocumentFavouriteStatus } from '../../actions/DocumentActions'
import { addDocToFavourites } from '../../actions/AlertActions'

import { deleteFavourites, deleteFavouritesDispatch } from '../../actions/FavouriteActions'
import NotificationAlertView from '../../utils/NotificationAlertView'
import NavigationHeader from '../../utils/NavigationHeader'
import RoundedBlueButton from '../../utils/CustomButtons/RoundedBlueButton'
import moment from 'moment'
import { Database } from '../../utils/DatabaseHelper'
import OfflineNotice from '../../utils/OfflineNotice'
import NotificationNotice from '../../utils/NotificationNotice'
import firebase from 'react-native-firebase'
let Analytics = firebase.analytics();
import { sendEmail } from '../../utils/Utility'




const { height: SCREEN_HEIGHT } = Dimensions.get('window')
const notificationDuration = 3000
const options = [
  'Email',
  'Print',
  {
    component: <Text style={{ color: COLOR.YELLOW, fontSize: 20, fontFamily: Platform.OS == 'ios' ? fonts.SourceSansProSemibold : fonts.SourceSansProBold }}>Cancel</Text>
  },
]
var isValid = (value) => !(value == undefined || value == 'null' || value == null || value == '' || value == 'undefined')

class DocumentScreen extends React.Component {
  static navigationOptions = {
    title: 'Alerts',
    headerShown: false,
  };


  constructor(props) {
    super(props);
    this.state = {
      filePath: '',
      isRelatedViewOpen: false,
      toggleAnimation: new Animated.Value(SCREEN_HEIGHT * 0.4),
      presentAnimation: new Animated.Value(0),
      selectedIndex: 0,
      citedDocuments: '',
      citedBy: '',
      isConnected: false,
      showNotification: false,
      status: '',
      message: '',
      loading: false,
      isLoadingForFav: false,
      isFavourite: '',
      hasAPIfailed: false,
      documentObj: '',
      userId: '',
      callingFromScreen: '',
      apiCalled: false,
      accessDeclined: false,
      //isFocused: true
    };

    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);


    // this.deleteFavouritesRequestThrottled = throttle(this.deleteFavouritesRequest.bind(this), 3000);
    // this.markDocumentAsFavouriteThrottled = throttle(this.markDocumentAsFavourite.bind(this), 3000);

  }

  componentDidMount() {
    this._shouldShowUserDetails()
    var source = this.state.callingFromScreen ? CONSTANTS.FIREBASE_ANALYTICS.ALERT_SCREEN : CONSTANTS.FIREBASE_ANALYTICS.FAVORITE_SCREEN
    Analytics.logEvent(CONSTANTS.FIREBASE_ANALYTICS.DOCUMENT_ITEM_VIEW, { "platform": Platform.OS, "userId": global.userID, "isFavoriteDocument": this.state.isFavourite, "source": source })
    // BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    // Analytics.logEvent(CONSTANTS.FIREBASE_ANALYTICS.DOCUMENT_ITEM_VIEW, { "platform": Platform.OS })
    const DocumentObj = this.props.navigation.getParam('DocumentData')
    const NotificationID = this.props.navigation.getParam('notificationID')
    let fav = DocumentObj.regulatorySnapshotOutput.isFavourite

    //Check whether data is empty or not, if yes user can't access the document.
    if (isNaN(DocumentObj.idrac) && DocumentObj.regulatorySnapshotOutput.title == "" &&
      DocumentObj.regulatorySnapshotOutput.regulatoryAbstract == "" && DocumentObj.regulatorySnapshotOutput.comments == "") {
      this.setState({
        accessDeclined: true
      })
    }

    this.setState({
      isFavourite: (fav === 'Y') ? true : false
    })

    let callingFrom = this.props.navigation.getParam('CallingFrom')
    this.setState({
      callingFromScreen: (callingFrom === 'Fav') ? true : false
    })
    // if (callingFrom.state.routeName === "FavouritesStack") {
    //   checkForFavDocument(DocumentObj.idrac, global.userID).then((res) => {
    //     this.setState({
    //       isFavourite: res
    //     }, () => alert(res))
    //   })
    // }

    if (callingFrom === 'Fav') {
      Database.markRead(DocumentObj.idrac, global.userID)
    } else if (callingFrom === 'Alert') {
      this.checkFavStatus(DocumentObj.idrac)
      Database.markRead(DocumentObj.idrac, global.userID, NotificationID)
    } else {
      this.checkFavStatus(DocumentObj.idrac)
      Database.markRead(DocumentObj.idrac, global.userID)
    }

    this.subs = [
      this.props.navigation.addListener('focus', this.componentDidFocus),
      this.props.navigation.addListener('blur', this.componentWillBlur),
    ];
    console.log('state',this.props.isConnected)
  }

  componentWillMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
  }


  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    this.subs.forEach(sub => sub.remove());
  }

  componentWillBlur = () => {
    this.setState({ isFocused: false })
  }

  componentDidFocus = () => {
    this.setState({ isFocused: true })
  }

  handleBackButtonClick() {
    // this.props.navigation.goBack(null);
    this.props.navigation.goBack()
    return true;
  }


  componentWillReceiveProps(newProps) {

    // this.setState({
    //   isConnected: newProps.isConnected
    // })

    // if (newProps.citedDocuments != "" && newProps.citedBy != "") {
    //   this.setState({
    //     citedDocuments: newProps.citedDocuments.data,
    //     citedBy: newProps.citedBy.data,
    //     loading: newProps.loading
    //   })
    // }

    this.setState({ hasAPIFailed: false })
    if (newProps.deleteData !== null && this.state.isFocused) {

      //if (newProps.deleteData !== null) {
      if (newProps.deleteData.error.status === 'success') {
        // if (!this.state.isDeleteFavouritesSuccessfull) {
        this.setState({
          removeDocList: [],
          status: newProps.deleteData.error.status,
          message: newProps.deleteData.error.message,
          showNotification: true,
          isFavourite: false,
          loading: false,
          isLoadingForFav: false
        }, () => {
          this.startAnimation()
          this.props.reset()
        })
        // }
      } else {
        this.setState({
          status: newProps.deleteData.error.status,
          message: newProps.deleteData.error.message,
          removeDocList: [],
          isDeleteFavouritesSuccessfull: false,
          showNotification: true,
          isFavourite: true,
          loading: false,
          isLoadingForFav: false
        }, () => {
          this.startAnimation()
          this.props.reset()
        })
      }
    }
    Analytics.logEvent(CONSTANTS.FIREBASE_ANALYTICS.CITED_BY_DOCUMENT, { "platform": Platform.OS })
    Analytics.logEvent(CONSTANTS.FIREBASE_ANALYTICS.CITED_BY_VIEW, { "platform": Platform.OS })
    //this.setState({ loading: newProps.loading })

  }


  //look for favourite status of a document 

  checkFavStatus = (idrac) => {
    if (this.props.isConnected) {
      this.setState({ loading: true, isLoadingForFav: true })
      AsyncStorage.getItem('userToken', (err, result) => {
        if (err) {
        } else {
          if (result == null) {
          } else {
            if (this.props.isConnected) {
              var favStatus = getDocumentFavouriteStatus(result, idrac, global.userID)
              Promise.all([favStatus]).then((values) => {
                this.setState({ isFavourite: values[0], loading: false, isLoadingForFav: false, }, () => {
                })
              }).catch(() => {
                this.setState({ loading: false, isLoadingForFav: false })
              })
            }
          }
        }
      });
    } else {
      checkForFavDocument(idrac, global.userID).then((res) => {
        this.setState({
          isFavourite: res
        })
      })
    }

  }

  showActionSheet = () => this.actionSheet.show()

  getActionSheetRef = ref => (this.actionSheet = ref)

  handlePress = async (index) => {
    const DocumentDir = Platform.OS == 'android' ? await RNFS.ExternalStorageDirectoryPath : await RNFS.DocumentDirectoryPath;
    this.setState({ selectedIndex: index }, () => {
      if (this.state.selectedIndex == 1 && this.props.navigation.getParam('DocumentData')) {
        Analytics.logEvent(CONSTANTS.FIREBASE_ANALYTICS.PRINT_DOCUMENT, { "platform": Platform.OS, "userId": global.userID, "source": CONSTANTS.FIREBASE_ANALYTICS.DOCUMENT_SCREEN })
        this.printRemotePDF(DocumentDir, this.props.navigation.getParam('DocumentData').idrac)
      }
      if (this.state.selectedIndex == 0) {
        Analytics.logEvent(CONSTANTS.FIREBASE_ANALYTICS.EMAIL_DOCUMENT, { "platform": Platform.OS, "userId": global.userID, "source": CONSTANTS.FIREBASE_ANALYTICS.DOCUMENT_SCREEN })
        this.handleEmail(this.props.navigation.getParam('DocumentData').idrac)
      }
    })
  }

  writeBase64StringToFile = (fileLocation, docId) => {
    return new Promise((RESOLVE, REJECT) => {
      AsyncStorage.getItem('userToken', (err, result) => {
        if (err) {
        }
        else {
          if (result == null) {
          }
          else {
            var stringToBeSplit = "data:application/pdf;base64,"
            RNFetchBlob.fetch('GET', BaseURL + CONSTANTS.API.DOWNLOAD_DOCUMENT(docId), {
              'ca-token': result,
              'Content-Type': 'application/pdf'
            }).then((res) => {
              if (res.data != 'Retrieve Service is currently not available.') {
                base64Str = stringToBeSplit + res.data;
                //  var Base64Code = base64Str.split(stringToBeSplit)
                RNFS.writeFile(fileLocation, base64Str, '')
                  .then(() => {
                    //Success  
                    console.log("DOCUMENTS WRITE Success");
                    RESOLVE(fileLocation);
                  })
                  .catch((err) => {
                    // silently log the error, on next login, app should retry
                    console.log("DOCUMENTS WRITE ERROR : " + err.message);
                    REJECT(fileLocation);
                    this.setState({ loading: false })
                  });

              } else {
                REJECT("");
              }
            }).catch(() => {
              this.setState({ loading: false })
              alert(CONSTANTS.DocumentDetails.DocNotValidError)
            })
          }
        }
      });
    }).catch((error) => {
      // error handling
      console.log("Error", error)
    });
  }
  getPdfFromServer = (DocumentDir, docId) => {
    return new Promise((RESOLVE, REJECT) => {
      let cortellisDir = ''

      RNFS.exists(DocumentDir).then(mainDirectoryExists => {
        if (mainDirectoryExists) {
          cortellisDir = DocumentDir + "/CortellisRI/"
          let fileLocation = cortellisDir + "cortellisPDF_" + docId + ".pdf"
          if (Platform.OS == 'android') {
            PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE).then(granted => {
              if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log("Permission OK")
                RNFS.exists(cortellisDir).then(exists => {
                  if (exists) {
                    RESOLVE(
                      this.writeBase64StringToFile(fileLocation, docId).catch(() => {
                        console.log(error)
                        this.setState({ loading: false })
                        alert(CONSTANTS.DocumentDetails.DocNotValidError)
                      })
                    );
                  } else {
                    RNFS.mkdir(cortellisDir).then(() => {
                      RESOLVE(
                        this.writeBase64StringToFile(fileLocation, docId).catch(() => {
                          console.log(error)
                          this.setState({ loading: false })
                          alert(CONSTANTS.DocumentDetails.DocNotValidError)
                        })
                      );
                    }).catch(error => {
                      console.log(error)
                      this.setState({ loading: false })
                      alert(CONSTANTS.DocumentDetails.DocNotValidError)
                    })
                  }
                })
              } else {
                this.setState({ loading: false }, () => {
                  Alert.alert(
                    CONSTANTS.DocumentDetails.PermissionDeniedError,
                    CONSTANTS.DocumentDetails.PermissionDeniedMessage,
                    [
                      { text: 'ok' },
                    ],
                    { cancelable: true }
                  )
                })
              }
            })
          }
          else {
            RNFS.exists(cortellisDir).then(exists => {
              if (exists) {
                RESOLVE(
                  this.writeBase64StringToFile(fileLocation, docId).catch(() => {
                    console.log(error)
                    this.setState({ loading: false })
                    alert(CONSTANTS.DocumentDetails.DocNotValidError)
                  })
                );
              } else {
                RNFS.mkdir(cortellisDir).then(() => {
                  RESOLVE(
                    this.writeBase64StringToFile(fileLocation, docId).catch(() => {
                      console.log(error)
                      this.setState({ loading: false })
                      alert(CONSTANTS.DocumentDetails.DocNotValidError)
                    })
                  );
                }).catch(error => {
                  console.log(error)
                  this.setState({ loading: false })
                  alert(CONSTANTS.DocumentDetails.DocNotValidError)
                })
              }
            })
          }

        } else {
          Toast.show({
            text: CONSTANTS.DocumentDetails.PDFAlreadyDownloaded
          })
        }
      }).catch(error => {
        console.log(error)
        this.setState({ loading: false })
      })
    }).catch((error) => {
      // error handling 
      console.log("Error", error)
      this.setState({ loading: false })
    });
  }

  downloadRemotePDF = (docID, actionType) => {
    return new Promise(async (RESOLVE, REJECT) => {

      var source = this.state.callingFromScreen ? CONSTANTS.FIREBASE_ANALYTICS.ALERT_SCREEN : CONSTANTS.FIREBASE_ANALYTICS.FAVORITE_SCREEN
      Analytics.logEvent(CONSTANTS.FIREBASE_ANALYTICS.DOCUMENT_VIEW_PDF, { "platform": Platform.OS, "userId": global.userID, "isFavoriteDocument": this.state.isFavourite, "source": source })
      const DocumentDir = Platform.OS == 'android' ? await RNFS.ExternalStorageDirectoryPath : await RNFS.DocumentDirectoryPath;
      if (this.props.isConnected) {
        this.setState({ loading: true })
        this.getPdfFromServer(DocumentDir, docID).then((fileLocation) => {
          if (fileLocation) {
            Database.addPdfLocation(docID, fileLocation, global.userID).then(() => {
              this.setState({ loading: false }, () => {
                RESOLVE(fileLocation)
              })
            })
          } else {
            this.setState({ loading: false }, () => {
              REJECT("")
            })
            alert(CONSTANTS.DocumentDetails.DocNotValidError)
          }
        }).catch(() => {
          this.setState({ loading: false }, () => {
            REJECT("")
          })
          if (actionType == 'print') {
            alert(CONSTANTS.FavouriteScreen.NotDownloadedErrorPrint)
          }
          else {
            alert(CONSTANTS.FavouriteScreen.NotDownloadedErrorViewDoc)
          }
        })
      } else {
        this.setState({ loading: true, isLoadingForFav: true })
        Database.retreivePDFLocation(docID, global.userID).then((res) => {
          this.setState({ loading: false, isLoadingForFav: false }, () => {
            if (res) {
              RESOLVE(res)
            } else {
              REJECT("")
              alert(CONSTANTS.DocumentDetails.DocNotValidError)
            }
          })
        }).catch(() => {
          this.setState({ loading: false, isLoadingForFav: false }, () => {
            REJECT("")
          })
          if (actionType == 'print') {
            alert(CONSTANTS.FavouriteScreen.NotDownloadedErrorPrint)
          }
          else {
            alert(CONSTANTS.FavouriteScreen.NotDownloadedErrorViewDoc)
          }
        })
      }
    })
  }

  getPdfFromFileDirectoryOrDownload = (DocumentDir, docId) => {
    return new Promise((RESOLVE, REJECT) => {
      let fileLocation = DocumentDir + "/CortellisRI/" + "cortellisPDF_" + docId + ".pdf"
      RNFS.exists(fileLocation).then(exists => {
        if (exists) {
          RESOLVE(fileLocation);

        } else {
          RESOLVE("");
        }
      }).catch((err) => {
        REJECT(err);
      })
    })
  }

  printRemotePDF = (DocumentDir, docID) => {
    let pdfLocation = ''

    this.getPdfFromFileDirectoryOrDownload(DocumentDir, docID).then((fileLocation) => {
      if (fileLocation != '') {
        RNFS.readFile(fileLocation).then(file => {
          var stringToBeSplit = "data:application/pdf;base64,"
          var Base64Code = file.split(stringToBeSplit)
          pdfLocation = DocumentDir + '/' + "temp_pdf.pdf";
          RNFetchBlob.fs.writeFile(pdfLocation, Base64Code[1], 'base64').then(() => {
            RNPrint.print({ filePath: pdfLocation })
          })
        })
      } else {
        this.downloadRemotePDF(docID, 'print').then((fileLocation) => {
          if (fileLocation != '') {
            RNFS.readFile(fileLocation).then(file => {
              var stringToBeSplit = "data:application/pdf;base64,"
              var Base64Code = file.split(stringToBeSplit)
              pdfLocation = DocumentDir + '/' + "temp_pdf.pdf";
              RNFetchBlob.fs.writeFile(pdfLocation, Base64Code[1], 'base64').then(() => {
                RNPrint.print({ filePath: pdfLocation })
              })
            })
          }
        })
      }
    }).catch((err) => {
      this.setState({ loading: false })
      alert(CONSTANTS.FavouriteScreen.PrintPdfErrorForNonDownloadedDocs)
    })
  }
  handleError = (error) => {
    if (error === 'not_available') error = CONSTANTS.FavouriteScreen.EmailClientNAError;
    if (event === 'cancelled') event = CONSTANTS.FavouriteScreen.EmailSendingFailedError;
    else if (event === 'sent') event = CONSTANTS.FavouriteScreen.EmailSent;
    Alert.alert(
      error,
      event,
      [
        { text: 'ok' },
      ],
      { cancelable: true }
    )
  }

  handleEmail = async (docId) => {
    var url = EmailDocumentUrl + docId
    var emailBody = CONSTANTS.FavouriteScreen.emailText + url

    sendEmail(CONSTANTS.FavouriteScreen.EmailSubject, emailBody).then(() => {
      console.log('Our email successful provided to device mail ');
    });

  }

  /*handleEmailOld = async (docId) => {
    let DOCID = docId
    let pdfFilePath = ''
    this.setState({ loading: true })
    const DocumentDir = Platform.OS == 'android' ? await RNFS.ExternalStorageDirectoryPath : await RNFS.DocumentDirectoryPath;
    await this.getPdfFromFileDirectoryOrDownload(DocumentDir, DOCID).then((pdfLocation) => {

      if (Platform.OS != 'ios') {
        PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE).then((granted) => {

          if (granted === PermissionsAndroid.RESULTS.GRANTED) {

            RNFS.readFile(pdfLocation).then(file => {
              var stringToBeSplit = "data:application/pdf;base64,"
              var Base64Code = file.split(stringToBeSplit)
              pdfFilePath = DocumentDir + '/' + CONSTANTS.FavouriteScreen.PdfName;
              RNFetchBlob.fs.writeFile(pdfFilePath, Base64Code[1], 'base64').then(() => {
                if (pdfFilePath != '') {
                  Mailer.mail({
                    subject: CONSTANTS.FavouriteScreen.EmailSubject,
                    recipients: [''],
                    ccRecipients: [''],
                    bccRecipients: [''],
                    body: CONSTANTS.FavouriteScreen.EmailBody,
                    isHTML: true,
                    attachment: {
                      path: pdfFilePath,
                      type: 'pdf',
                      name: CONSTANTS.FavouriteScreen.PdfName,
                    }
                  }, (error, event) => {
                    if (error === 'not_available') error = CONSTANTS.FavouriteScreen.EmailClientNAError;
                    if (event === 'cancelled') event = CONSTANTS.FavouriteScreen.EmailSendingFailedError;
                    else if (event === 'sent') event = CONSTANTS.FavouriteScreen.EmailSent;
                    RNFS.exists(pdfFilePath).then((result) => {
                      if (result) {
                        return RNFS.unlink(pdfFilePath)
                          .then(() => {
                            this.setState({ loading: false })
                          })
                          .catch((err) => {
                            console.log(err.message);
                            this.setState({ loading: false })
                          });
                      }
                    }).catch((err) => {
                      console.log(err.message);
                      this.setState({ loading: false })
                    });

                    Alert.alert(
                      event,
                      error,
                      [
                        { text: 'Ok', onPress: () => { this.setState({ loading: false }) } },
                        { text: 'Cancel', onPress: () => { this.setState({ loading: false }) } }
                      ],
                      { cancelable: true }
                    )
                  });
                }
              }).catch((err) => {
                console.log(err.message);
                this.setState({ loading: false })
              });
            })

          } else {
            this.setState({ loading: false }, () => {
              Alert.alert(
                CONSTANTS.DocumentDetails.PermissionDeniedError,
                CONSTANTS.DocumentDetails.PermissionDeniedMessage,
                [
                  { text: 'ok' },
                ],
                { cancelable: true }
              )
            })
          }
        }).catch((err) => {
          console.log(err.message);
          this.setState({ loading: false })
        });
        this.setState({ loading: false })
      } else {
        RNFS.readFile(pdfLocation).then(file => {
          var stringToBeSplit = "data:application/pdf;base64,"
          var Base64Code = file.split(stringToBeSplit)
          pdfFilePath = DocumentDir + '/' + CONSTANTS.FavouriteScreen.PdfName;
          RNFetchBlob.fs.writeFile(pdfFilePath, Base64Code[1], 'base64').then(() => {
            if (pdfFilePath != '') {
              Mailer.mail({
                subject: CONSTANTS.FavouriteScreen.EmailSubject,
                recipients: [''],
                ccRecipients: [''],
                bccRecipients: [''],
                body: CONSTANTS.FavouriteScreen.EmailBody,
                isHTML: true,
                attachment: {
                  path: pdfFilePath,
                  type: 'pdf',
                  name: CONSTANTS.FavouriteScreen.PdfName,
                }
              }, (error, event) => {
                if (error === 'not_available') error = CONSTANTS.FavouriteScreen.EmailClientNAError;
                if (event === 'cancelled') event = CONSTANTS.FavouriteScreen.EmailSendingFailedError;
                else if (event === 'sent') event = CONSTANTS.FavouriteScreen.EmailSent;

                RNFS.exists(pdfFilePath).then((result) => {
                  if (result) {
                    return RNFS.unlink(pdfFilePath)
                      .then(() => {
                        this.setState({ loading: false })
                      })
                      .catch((err) => {
                        console.log(err.message);
                        this.setState({ loading: false })
                      });
                  }
                }).catch((err) => {
                  console.log(err.message);
                  this.setState({ loading: false })
                });
                Alert.alert(
                  event,
                  error,
                  [
                    { text: 'Ok', onPress: () => { this.setState({ loading: false }) } },
                    { text: 'Cancel', onPress: () => { this.setState({ loading: false }) } }
                  ],
                  { cancelable: true }
                )
              });
            }
          })
        })
      }
    }).catch((err) => {
      this.setState({ loading: false })
      alert(CONSTANTS.FavouriteScreen.NotDownloadedError)
    })
  }*/

  startAnimation = () => {
    Animated.timing(this.state.presentAnimation, {
      toValue: 1,
      duration: 500,
      delay: 0,
      useNativeDriver: true
    }).start(() => {
      setTimeout(() => {
        this.setState({ showNotification: !this.state.showNotification });
      }, notificationDuration);
    })
  }

  render() {
    const DocumentObj = this.props.navigation.getParam('DocumentData')


    let bottomBarTranslateY = this.state.presentAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [-100, 0]
    })
    return (

      <View style={!this.state.accessDeclined ? styles.mainview : styles.accessDeclinedView}>

        {this.state.showNotification && (
          <Animated.View style={{ position: 'absolute', width: '100%', zIndex: 2, transform: [{ translateY: bottomBarTranslateY }] }}>
            {this.state.showNotification != "" &&
              <NotificationAlertView BGColor={this.state.status == 'success' ? COLOR.GREEN_SUCCESS : COLOR.PINK} titleviewstyle={[styles.titleviewstyle, { backgroundColor: this.state.status == 'success' ? COLOR.GREEN_SUCCESS : COLOR.PINK }]} headerstyle={styles.headerstyle} title={this.state.message}>
              </NotificationAlertView>
            }
          </Animated.View>
        )}
        <SafeAreaView style={styles.SafeAreaViewTop}>
          <NavigationHeader showActionButton={true} title={'Document'} backAction={this.backPress} back={true} ></NavigationHeader>
        </SafeAreaView>
        {this.state.accessDeclined ?
          <View style={[styles.accessDeclinedView,{padding: 20,marginTop: 20}]}>
            <Text style={styles.accessDeclinedViewTitle}>{CONSTANTS.ACCESS_DECLINED_TITLE}</Text>
            <View style={styles.accessDeclinedLineView}></View>
            <Text style={styles.accessDeclinedViewMessage}>{CONSTANTS.ACCESS_DECLINED_MESSAGE}</Text>
          </View> :

        <View style={styles.mainview}>

        {this.renderDocumentData(DocumentObj)}
        {this.state.isRelatedViewOpen && (this.relatedView())}

        <ActionSheet
          ref={this.getActionSheetRef}
          options={options}
          cancelButtonIndex={2}
          destructiveButtonIndex={2}
          onPress={this.handlePress}
        />
        <SafeAreaView style={[styles.SafeAreaViewTop, { backgroundColor: '#fff' }]} >
          <BottomBar
            isNetConnected={this.props.isConnected}
            showItems={3}
            tab1Text={CONSTANTS.RELATED}
            isFavEnabled={true}
            tab1Image={<SvgRelated fill={COLOR.LIGHT_GRAY_TEXT} />}
            tab1SelectedImage={<SvgRelated fill={COLOR.THEME_COLOR} />}

            tab2Text={this.state.isFavourite ? CONSTANTS.REMOVE : CONSTANTS.FAVOURITE}
            tab2UnSelectionColor={this.state.isFavourite ? COLOR.THEME_COLOR : COLOR.LIGHT_GRAY_TEXT}
            tab2SelectedImage={this.state.isFavourite ? <SvgFilledStar fill={COLOR.THEME_COLOR} /> : <SvgStar fill={COLOR.THEME_COLOR} />}
            tab2Image={this.state.isFavourite ? <SvgFilledStar fill={COLOR.THEME_COLOR} /> : <SvgStar fill={COLOR.LIGHT_GRAY_TEXT} />}
            //tab2Text={this.state.callingFromScreen ? CONSTANTS.FAVOURITE : (this.state.isFavourite ? CONSTANTS.REMOVE : CONSTANTS.FAVOURITE)}
            //tab2UnSelectionColor={this.state.callingFromScreen ? COLOR.LIGHT_GRAY_TEXT : (this.state.isFavourite ? COLOR.THEME_COLOR : COLOR.LIGHT_GRAY_TEXT)}
            //tab2Image={this.state.callingFromScreen ? <SvgStar fill={COLOR.LIGHT_GRAY_TEXT} /> : (this.state.isFavourite ? <SvgFilledStar fill={COLOR.THEME_COLOR} /> : <SvgStar fill={COLOR.LIGHT_GRAY_TEXT} />)}
            // tab2SelectedImage={this.state.callingFromScreen ? <SvgStar fill={COLOR.THEME_COLOR} /> : (this.state.isFavourite ? <SvgFilledStar fill={COLOR.THEME_COLOR} /> : <SvgStar fill={COLOR.THEME_COLOR} />)}

            tab3Text={CONSTANTS.SHARE}
            tab3Image={<SvgShare fill={COLOR.LIGHT_GRAY_TEXT} />}
            tab3SelectedImage={<SvgShare fill={COLOR.THEME_COLOR} />}

            onTab1Press={this.onRelatedPress}
            onTab2Press={(isSelected) => {

              if (this.state.isRelatedViewOpen) {
                this.toggleRelatedView()
              }

              // if (this.props.isConnected) {
              //   if (isSelected && this.state.callingFromScreen) {
              //     this.markDocumentAsFavourite()
              //   }
              //   else if (isSelected && !this.state.callingFromScreen) {
              //     if (this.state.isFavourite) {
              //       this.deleteFavouritesRequest()
              //     }
              //     else {
              //       this.markDocumentAsFavourite()
              //     }
              //   }
              // }

              if (this.props.isConnected) {
                if (isSelected && this.state.isFavourite) {
                  this.deleteFavouritesRequest()
                }
                else {
                  this.markDocumentAsFavourite()
                }
              }

            }}
            onTab3Press={() => {
              if (this.state.isRelatedViewOpen) {
                this.toggleRelatedView()
              }
              this.onSharePress()
            }}>

          </BottomBar>
        </SafeAreaView>
        {this.state.loading && (
          <View style={styles.loading}>
            <ActivityIndicator color="white" size="large" />
            {this.state.isLoadingForFav ?
              <Text style={{ color: "white", fontFamily: fonts.SourceSansProBold, fontSize: Normalize(16) }}>Loading...</Text>
              :
              <Text style={{ color: "white", fontFamily: fonts.SourceSansProBold, fontSize: Normalize(16) }}>Downloading...</Text>}
          </View>
        )}
        <OfflineNotice ConnectionStatus={this.props.isConnected} />
        {this.state.hasAPIFailed && (
          <NotificationNotice status={'Fail'} displayText={ CONSTANTS.ERROR_MESSAGE} />
        )}
         </View> }
      </View>
    )

  }

  toggleRelatedView = () => {
    let finalValue = this.state.isRelatedViewOpen ? SCREEN_HEIGHT * 0.4 : 0;
    this.setState({
      isRelatedViewOpen: !this.state.isRelatedViewOpen,
    }, () => {
      Animated.timing(this.state.toggleAnimation, {
        toValue: finalValue,
        duration: 200,
      }).start()
    })
  }

  onRelatedPress = () => {
    if (!this.state.apiCalled) {
      this.getCitedByAndCitedDocsAPI()
    } else {
      this.setState({ isRelatedViewOpen: true })
      this.toggleRelatedView()
    }
  }

  onSharePress = () => {
    Analytics.logEvent(CONSTANTS.FIREBASE_ANALYTICS.SHARE_CLICK_DOCUMENT, { "platform": Platform.OS })
    this.showActionSheet()
  }
  _shouldShowUserDetails = () => {
    AsyncStorage.getItem('userObject', (err, result) => {
      if (err) {
      } else {
        if (result == null) {
          console.log("null value recieved", result);
        } else {
          userData = JSON.parse(result)
          let userId = userData['1p:pid']
          this.setState({ userId: userId })
        }
      }
    });
  };

  deleteFavouritesRequest = () => {
    this.setState({ loading: true, isLoadingForFav: true })
    Analytics.logEvent(CONSTANTS.FIREBASE_ANALYTICS.REMOVE_FAVOURITE_DOCUMENT, { "platform": Platform.OS })
    const DocumentObj = this.props.navigation.getParam('DocumentData')
    let deleteFavRequest = {
      data: {
        userId: this.state.userId,
        documentIds: [DocumentObj.idrac]
      }
    }

    AsyncStorage.getItem('userToken', (err, result) => {
      if (err) {
      }
      else {
        if (result == null) {

        } else {
          this.props.deleteFavouritesDispatch(result, deleteFavRequest, global.userID)

        }
      }
    });
  }


  markDocumentAsFavourite = async () => {
    this.setState({ loading: true, isLoadingForFav: true })
    const documentObj = this.props.navigation.getParam('DocumentData')

    AsyncStorage.getItem('userToken', (err, result) => {
      if (err) {
      }
      else {
        if (result == null) {

        }
        else {
          let insertCitedByDocs = (this.props.navigation.getParam('CallingFrom') === "CitedBy") ? true : false
          addDocToFavourites(result, [documentObj], global.userID, insertCitedByDocs).then(res => {
            if (res != "") {
              if (res.status === 'success') {
                // if (!this.state.isAddDocToFavouriteSuccessfull) {
                this.setState({
                  status: res.status,
                  message: res.message,
                  addDocList: [],
                  // isAddDocToFavouriteSuccessfull: true,
                  showNotification: true,
                  isFavourite: true,
                  loading: !this.state.loading,
                  isLoadingForFav: false
                }, () => {
                  this.startAnimation()
                })
                // }
              }
              else {
                this.setState({
                  status: res.status,
                  message: res.message,
                  addDocList: [],
                  // isAddDocToFavouriteSuccessfull: false,
                  showNotification: true,
                  isFavourite: false,
                  loading: !this.state.loading,
                  isLoadingForFav: false
                }, () => {
                  this.startAnimation()
                })
              }
            }
          }).catch(() => {
            this.setState({ loading: !this.state.loading, hasAPIfailed: true })
          })
        }
      }
    });

  }

  getCitedByAndCitedDocsAPI = () => {
    const DocumentObj = this.props.navigation.getParam('DocumentData')
    if (this.props.isConnected) { this.setState({ loading: true, isLoadingForFav: true }) }
    AsyncStorage.getItem('userToken', (err, result) => {
      if (err) {
      } else {
        if (result == null) {
        } else {
          if (this.props.isConnected) {
            var citedDocPromise = getCitedDocuments(result, DocumentObj.idrac)
            var citedByPromise = getCitedBy(result, DocumentObj.idrac)
            Promise.all([citedDocPromise, citedByPromise]).then((values) => {
              this.setState({ citedDocuments: values[0], citedBy: values[1], loading: false, isLoadingForFav: false, apiCalled: true }, () => {
                this.setState({ isRelatedViewOpen: true })
                this.toggleRelatedView()
              })
            }).catch(() => {
              this.setState({ loading: false, isLoadingForFav: false })
              alert(CONSTANTS.ERROR_MESSAGE)
            })
          }
        }
      }
    });
  }

  onDocumentSelection = async (documentID) => {
    if (this.props.isConnected) {
      this.setState({ loading: true, isLoadingForFav: true })
      try {
        var token = await AsyncStorage.getItem('userToken')
        if (token !== null) {
          getSnapShotObject(token, documentID).then((documentItem) => {
            { this.setState({ loading: false, isLoadingForFav: false }) }
            this.props.navigation.push('DocumentScreen', {
              DocumentData: documentItem,
              CallingFrom: "CitedBy"
            });
          }).catch((err) => {
            { this.setState({ loading: false, isLoadingForFav: false }) }
            alert(CONSTANTS.ERROR_MESSAGE)
          })
        }
      } catch (err) {
        { this.setState({ loading: false, isLoadingForFav: false }) }
        console.log(`The error is: ${err}`)
      }
    }
  }

  relatedView = () => {
    return (
      <RelatedView
        citedDocuments={this.state.citedDocuments}
        citedBy={this.state.citedBy}
        toggleAnimation={this.state.toggleAnimation}
        isRelatedViewOpen={this.state.isRelatedViewOpen}
        onDocumentSelection={(id) => this.onDocumentSelection(id)}
      />
    )
  }

  backPress = () => {
    this.props.navigation.goBack()
  }


  backAction = () => {
  }

  getDateFromTimestamp = (timestamp) => {
    if (isValid(timestamp)) {
      let spaceIndex = timestamp.indexOf(' ')
      if (spaceIndex != -1) {
        timestamp = timestamp.substring(0, spaceIndex)
      }
      return timestamp
    } else {
      return ''
    }
  }
  renderDocumentData = (data) => {
    {/* <Text style={styles.descText}>{data.regulatorySnapshotOutput.regulatoryAbstract.replace(/<[^>]*>?/gm, '')}</Text> */ }
    var abstract = data.regulatorySnapshotOutput.regulatoryAbstract.replace(/<Link[^>]*>?/gm, '')
    var abstract = abstract.replace(/<[^]Link>*>?/gm, '')
    var abstract = abstract.replace(/<[^>]*>?/gm, "\n")

    return (
      <ScrollView>
        <View style={{ flexDirection: 'column' }}>
          <View style={styles.headerview}>
            <Text style={styles.headerText} numberOfLines={3} ellipsizeMode="tail">{data.regulatorySnapshotOutput.title}</Text>
          </View>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            <View style={styles.middleview}>

              {isValid(data.regulatorySnapshotOutput.regulatoryDateForceDisplay) && <View style={{ maxWidth: 130, flexDirection: 'column', justifyContent: 'center', marginHorizontal: NormalizeLayout(14) }}>
                <Text style={styles.label}>{CONSTANTS.INFORCE}</Text>
                <View style={{ flexDirection: 'row' }}>
                  <SvgCalendar style={{ marginTop: NormalizeLayout(3), }} />
                  <Text style={styles.labelValue}>{(this.getDateFromTimestamp(data.regulatorySnapshotOutput.regulatoryDateForceDisplay) !== "") ? moment(this.getDateFromTimestamp(data.regulatorySnapshotOutput.regulatoryDateForceDisplay ? data.regulatorySnapshotOutput.regulatoryDateForceDisplay : "19-Feb-2017")).format('DD MMMM YYYY') : "N/A"}</Text>
                </View>
              </View>}

              {isValid(data.regulatorySnapshotOutput.regulatoryDateForceDisplay) && <View style={styles.separatorview}></View>}
              <View style={{ maxWidth: 120, marginHorizontal: NormalizeLayout(14), justifyContent: 'center', flexDirection: 'column', }}>
                <Text style={styles.label}>{'DATE'}</Text>
                <View style={{ flexDirection: 'row' }}>
                  <SvgCalendar style={{ marginTop: NormalizeLayout(5) }} />
                  <Text style={styles.labelValue}>{isValid(data.regulatorySnapshotOutput.dateDisplay) ? data.regulatorySnapshotOutput.dateDisplay : 'N/A'}</Text>
                </View>
              </View>

              <View style={styles.separatorview}></View>

              <View style={{ maxWidth: 100, marginHorizontal: NormalizeLayout(14), justifyContent: 'center', flexDirection: 'column' }}>
                <View><Text style={styles.label}>{CONSTANTS.STATUS}</Text></View>
                <View style={{ flexDirection: 'row' }}>
                  <SvgStatus style={{ marginTop: NormalizeLayout(5) }} />
                  <Text style={styles.labelValue}>{data.regulatorySnapshotOutput.status}</Text>
                </View>
              </View>
              <View style={styles.separatorview}></View>

              <View style={{ maxWidth: 100, marginHorizontal: NormalizeLayout(14), justifyContent: 'center', flexDirection: 'column', }}>
                <Text style={styles.label}>{CONSTANTS.IDRAC}</Text>
                <View style={{ flexDirection: 'row' }}>
                  <SvgIdrac style={{ marginTop: NormalizeLayout(5) }}></SvgIdrac>
                  <Text style={styles.labelValue}>{data.idrac}</Text>
                </View>
              </View>

              <View style={styles.separatorview}></View>

              <View style={{ maxWidth: 120, marginHorizontal: NormalizeLayout(14), justifyContent: 'center', flexDirection: 'column', }}>
                <Text style={styles.label}>{CONSTANTS.REGION}</Text>
                <View style={{ flexDirection: 'row' }}>
                  <SvgRegion style={{ marginTop: NormalizeLayout(5) }} />
                  <Text style={styles.labelValue}>{isValid(data.regulatorySnapshotOutput.region) ? data.regulatorySnapshotOutput.region : 'N/A'}</Text>
                </View>
              </View>

              <View style={styles.separatorview}></View>
              <View style={{ maxWidth: 120, marginHorizontal: NormalizeLayout(14), justifyContent: 'center', flexDirection: 'column', }}>
                <Text style={styles.label}>{'REGULATORY VERSION'}</Text>
                <View style={{ flexDirection: 'row' }}>
                  <SvgVersion style={{ marginTop: NormalizeLayout(5) }} />
                  <Text style={styles.labelValue}>{isValid(data.regulatorySnapshotOutput.version) ? data.regulatorySnapshotOutput.version : 'N/A'}</Text>
                </View>
              </View>

              <View style={styles.separatorview}></View>
              <View style={{ maxWidth: 200, marginHorizontal: NormalizeLayout(14), justifyContent: 'center', flexDirection: 'column', }}>
                <Text style={styles.label}>{'LANGUAGE(S)'}</Text>
                <View style={{ flexDirection: 'row' }}>
                  <SvgLanguages style={{ marginTop: NormalizeLayout(5) }} />
                  <Text style={styles.labelValue}>{isValid(data.regulatorySnapshotOutput.languages) ? data.regulatorySnapshotOutput.languages : 'N/A'}</Text>
                </View>
              </View>

              <View style={styles.separatorview}></View>
              <View style={{ maxWidth: 350, marginHorizontal: NormalizeLayout(14), justifyContent: 'center', flexDirection: 'column', }}>
                <Text style={styles.label}>{'SOURCE'}</Text>
                <View style={{ flexDirection: 'row' }}>
                  <SvgSource style={{ marginTop: NormalizeLayout(5) }} />
                  <Text ellipsizeMode='tail' style={styles.labelValue}>{data.regulatorySnapshotOutput.source.replace(/<[^>]*>?/gm, ' , ')}</Text>
                </View>
              </View>



              {/* <View style={styles.separatorview}></View>
              <View style={{maxWidth: 120, marginHorizontal: NormalizeLayout(14), justifyContent: 'center', flexDirection: 'column',}}>
                <Text style={styles.label}>{'READY TO USE FORMS'}</Text>
                <View style={{ flexDirection: 'row' }}>
                  <SvgForms style={{ marginTop: NormalizeLayout(5) }}/>
                  <Text style={styles.labelValue}>{data.idrac}</Text>
                </View>
              </View> */}

            </View>

          </ScrollView>
          <View style={(isValid(data.regulatorySnapshotOutput.topic) || isValid(data.regulatorySnapshotOutput.medicalDeviceSpecialty)) ? { backgroundColor: COLOR.TAB_BG_COLOR, padding: NormalizeLayout(14) }: {}}>
            {isValid(data.regulatorySnapshotOutput.topic) &&
            <View>
              <Text style={styles.label}>TOPICS</Text>
              <Text style={{ fontSize: Normalize(14), marginTop: Normalize(2), color: COLOR.BLACK_TEXT, fontFamily: fonts.SourceSansProRegular, }} numberOfLines={3} ellipsizeMode="tail">{isValid(data.regulatorySnapshotOutput.topic) ? data.regulatorySnapshotOutput.topic : 'N/A'}</Text>
            </View>}
            { isValid(data.regulatorySnapshotOutput.medicalDeviceSpecialty) &&
              <View style={{ marginTop: NormalizeLayout(5) }}>
                <Text style={styles.label}>MEDICAL DEVICE SPECIALITIES</Text>
                <Text style={{ fontSize: Normalize(14), marginTop: Normalize(2), color: COLOR.BLACK_TEXT, fontFamily: fonts.SourceSansProRegular, }} numberOfLines={3} ellipsizeMode="tail">{isValid(data.regulatorySnapshotOutput.medicalDeviceSpecialty) ? data.regulatorySnapshotOutput.medicalDeviceSpecialty : 'N/A'}</Text>
              </View>

            }

          </View>

          <RoundedBlueButton text={CONSTANTS.VIEW_DOC} blueButtonStyle={styles.roundedButtonStyle} textStyle={styles.textStyle}
            onPress={() => {
              this.downloadRemotePDF(data.idrac, 'view').then((fileLocation) => {
                this.props.navigation.navigate('DocumentViewScreen', {
                  DocumentData: fileLocation
                });
              })
            }}
          ></RoundedBlueButton>

          <View style={{ padding: 20 }}>
            {/* <Text style={styles.descText}>{data.regulatorySnapshotOutput.regulatoryAbstract.replace(/<[^>]*>?/gm, '')}</Text> */}
            {/* <Text style={styles.descText}>{data.regulatorySnapshotOutput.regulatoryAbstract.replace(/,/g'<br/>', "\n"))}</Text> */}
            <Text style={styles.descText}>{abstract}</Text>
          </View>
          <Text style={styles.commentsLabelText}>{CONSTANTS.COMMENTS}</Text>
          <View style={{ padding: 20 }}>
            <Text style={styles.commentsText}>{data.regulatorySnapshotOutput.comments.replace(/<[^>]*>?/gm, '')}</Text>
          </View>


        </View>
      </ScrollView>

    )
  }

  onSort = () => {
    this.setState({ showSortView: true })
  }

}


const styles = StyleSheet.create({
  container: {
    paddingTop: NormalizeLayout(15),
    backgroundColor: '#fff',
  },
  counterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
    padding: NormalizeLayout(8),
  },
  paragraph: {
    margin: NormalizeLayout(24),
    fontSize: Normalize(20),
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: fonts.SourceSansProRegular,
  },
  flatview: {},
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
  sepview: {
    width: '100%',
    backgroundColor: COLOR.Gray_Sep,
    height: NormalizeLayout(2)
  },
  mainview: {
    flexDirection: 'column',
    flex: 1
  },
  accessDeclinedView: {
    flexDirection: 'column',
    flex: 1,
    backgroundColor: COLOR.WHITE,
  },
  accessDeclinedLineView: {
    height: 1,
    backgroundColor: 'black',
    marginTop: 8,
    marginBottom: 8
  },
  headerview: {
    justifyContent: 'space-between',
    backgroundColor: COLOR.TAB_BG_COLOR,
    paddingTop: NormalizeLayout(5),
    paddingBottom: NormalizeLayout(5)
  },
  labelValue: {
    marginTop: NormalizeLayout(3),
    marginLeft: NormalizeLayout(5),
    marginRight: NormalizeLayout(5),
    height: NormalizeLayout(17),
    fontSize: Normalize(12),
    color: COLOR.BLACK_TEXT,
    fontFamily: fonts.SourceSansProRegular,
  },
  headerText: {
    marginTop: NormalizeLayout(12),
    marginLeft: NormalizeLayout(14),
    marginRight: NormalizeLayout(12),
    marginBottom: NormalizeLayout(12),
    fontSize: Normalize(14),
    color: COLOR.BLACK_TEXT,
    fontFamily: fonts.SourceSansProRegular,
  },
  rightTextView: {
    marginTop: NormalizeLayout(20),
    marginBottom: NormalizeLayout(20),
    marginRight: NormalizeLayout(20),
    fontSize: Normalize(16),
    color: '#555555',
    fontFamily: fonts.SourceSansProRegular,
  },
  separatorview: {
    backgroundColor: '#E1E4E6',
    width: NormalizeLayout(1),
    borderRadius: NormalizeLayout(1),
    height: '90%'
  },
  rowView: {
    flexDirection: 'row',
    height: NormalizeLayout(56),
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
  label: {
    color: COLOR.GRAY_TEXT,
    fontSize: Normalize(10),
    height: Normalize(13),
    textAlign: 'left',
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
    paddingLeft: NormalizeLayout(16),
    paddingRight: NormalizeLayout(16),
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
    paddingRight: NormalizeLayout(10)
  },
  roundedButtonStyle: {
    marginTop: NormalizeLayout(16),
    marginLeft: NormalizeLayout(40),
    marginRight: NormalizeLayout(40),
    paddingBottom: NormalizeLayout(16),
    paddingTop: NormalizeLayout(12),
    paddingLeft: NormalizeLayout(62),
    paddingRight: NormalizeLayout(62),
    backgroundColor: COLOR.THEME_COLOR,
    borderRadius: NormalizeLayout(24),
    height: NormalizeLayout(48)
  },
  buttonStyle: {},

  textStyle: {
    textAlign: 'center',
    color: COLOR.WHITE,
    fontSize: Normalize(16),
    fontFamily: fonts.SourceSansProRegular,
    lineHeight: NormalizeLayout(20),
    fontWeight: '600'
  },
  descText: {
    fontSize: Normalize(14),
    fontFamily: fonts.SourceSansProRegular,
    color: COLOR.BLACK_TEXT,
  },
  commentsLabelText: {
    marginLeft: NormalizeLayout(20),
    marginRight: NormalizeLayout(20),
    fontSize: Normalize(14),
    fontFamily: fonts.SourceSansProBold,
    color: COLOR.BLACK_TEXT,
    fontWeight: 'bold',
    lineHeight: NormalizeLayout(18),
  },
  commentsText: {
    fontSize: Normalize(14),
    color: COLOR.BLACK_TEXT,
    fontFamily: fonts.SourceSansProRegular,
    fontWeight: 'normal',
    textAlign: 'justify',
  },
  middleview: {
    paddingTop: NormalizeLayout(14),
    paddingBottom: NormalizeLayout(14),
    flexDirection: 'row'
  },
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.75,
    alignItems: 'center',
    backgroundColor: 'black',
    justifyContent: 'center',
    height: '100%'
  },
  accessDeclinedViewTitle: {
    fontSize: Normalize(14),
    fontFamily: fonts.SourceSansProSemibold,
    color: COLOR.BLACK_TEXT,
    fontWeight: 'bold'
  },
  accessDeclinedViewMessage: {
    fontSize: Normalize(14),
    fontFamily: fonts.SourceSansProRegular,
    color: COLOR.BLACK_TEXT,
    fontWeight: 'normal'
  }
});

/*
Bind state and dispatch actions to props
*/
const mapStateToProps = (state) => ({
  loading: state.documentsData.loading,
  successData: state.documentsData.successData,
  citedDocuments: state.documentsData.citedDocuments,
  citedBy: state.documentsData.citedBy,
  errorMessage: state.documentsData.errorMessage,
  isConnected: state.offlineReducer.isConnected,
  deleteData: state.favouritesData.deleteData,
  documentObject: state.documentsData.documentObject
});

const mapDispatchToProps = dispatch => {
  return {
    deleteFavouritesDispatch: (token, addDocToRemoveRequest, USER_ID) => { dispatch(deleteFavouritesDispatch(token, addDocToRemoveRequest, USER_ID)); },
    //getCitedDocuments: (token, idrac) => { dispatch(getCitedDocuments(token, idrac)) },
    // getCitedBy: (token, idrac) => { dispatch(getCitedBy(token, idrac)) },
    reset: () => { dispatch({ type: 'RESET_FAV' }) }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DocumentScreen);