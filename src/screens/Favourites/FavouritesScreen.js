import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView, Platform, Animated, ActivityIndicator, Alert, PermissionsAndroid } from 'react-native';
import  AsyncStorage  from "@react-native-community/async-storage";

import { connect } from "react-redux";
import { CheckBox, StyleProvider } from 'native-base'

import FavouriteListRow from './FavouriteListRow'
import FavouriteListRowSelectable from './FavouriteListRowSelectable'
import { COLOR } from '../../constants/Colors'
import { Normalize, NormalizeLayout } from '../../utils/Scale'
import NavigationHeader from '../../utils/NavigationHeader'
import { CONSTANTS } from '../../constants/Constants'
import NotificationAlertView from '../../utils/NotificationAlertView'
import fonts from '../../utils/CortellisFonts'
import BottomBar from '../../utils/BottomBar'
import RNFetchBlob from 'react-native-fetch-blob';
import RNFS from 'react-native-fs'
import RNPrint from 'react-native-print';
// import Mailer from 'react-native-mail';
import Modal from 'react-native-modal'
// import { zip } from 'react-native-zip-archive'
import SvgShare from '../../../assets/svgimage/Share'
import SvgFilledStar from  '../../../assets/svgimage/filledStar'
import SvgStar2 from '../../../assets/svgimage/Star'
import ActionSheet from '../../utils/CustomActionSheet/ActionSheet'
import { fetchFavourites, deleteFavouritesDispatch, getFavouritesFromLocalDatabase, fetchFavouriteNotification } from '../../actions/FavouriteActions'
import RoundedBlueButton from '../../utils/CustomButtons/RoundedBlueButton'
import OfflineNotice from '../../utils/OfflineNotice'
import Moment from 'moment'
import { Database } from '../../utils/DatabaseHelper'
import { BaseURL, EmailDocumentUrl } from '../../configurations/configurations'

import firebase from 'react-native-firebase'
import getTheme from '../../../native-base-theme/components';
import material from '../../../native-base-theme/variables/material';
import { sendEmail } from '../../utils/Utility'



let Analytics = firebase.analytics();

const options = [
  'Email',
  'Print',
  {
    component: <Text style={{ color: COLOR.YELLOW, fontSize: 20, fontFamily: Platform.OS == 'ios' ? fonts.SourceSansProSemibold : fonts.SourceSansProBold }}>Cancel</Text>
  },
]
const notificationDuration = 3000

class FavouritesScreen extends React.Component {
  static navigationOptions = {
    headerShown: false
  };


  constructor(props) {
    super(props);
    this.state = {
      isSelectionModeOn: false,
      showSortView: false,
      favouritesData: [],
      removeDocList: [],
      presentAnimation: new Animated.Value(0),
      showNotification: false,
      nameCheckboxValue: false,
      dateCheckboxValue: true,
      status: '',
      message: '',
      loading: false,
      isLoadingForDownload: false,
      isTabBarVisible: true,
      isConnected: undefined,
      isFetching: false,
      comingFromNotificationFlow: this.props.navigation.getParam("isComingFromNotification", false) ? true : false,
    }
  };

  componentDidMount() {
    Analytics.logEvent(CONSTANTS.FIREBASE_ANALYTICS.FAVOURITE_TAB_CLICK, { "platform": Platform.OS, "userId": global.userID })
    this.didFocusListener = this.props.navigation.addListener(
      'focus', () => {
        if (this.state.favouritesData.length > 0) {
          this.getFavouritesFromLocalDatabase()
        }
        else {
          this.getFavourites()
        }
      }
    );
    if(this.state.comingFromNotificationFlow){
      const uuid = this.props.navigation.getParam("uuid" )
      AsyncStorage.getItem('userToken', (err, result) => {
        if (err) {
        }
        else {
            if (result == null) {
            }
            else {
                this.setState({ loading: true, isLoadingForDownload: false })
                fetchFavouriteNotification(result, uuid).then((res) => {
                  this.props.navigation.navigate('DocumentScreen', {
                    DocumentData: res,
                    CallingFrom: "Fav"
                  });
                  this.setState({loading: false, isLoadingForDownload: false})
                }).catch((err) =>{
                  alert("Something went wrong.")
                })
            }}
        })
    }

  }

  componentWillUnmount() {
    this.didFocusListener.remove();

  }

  getFavourites = async () => {
    let token = await AsyncStorage.getItem('userToken')
    this.props.getFavourites(token, global.userID)
  }

  getFavouritesFromLocalDatabase = async () => {
    this.props.getFavouritesFromLocalDatabase(global.userID)
  }


  deleteFavourites = () => {
    Analytics.logEvent(CONSTANTS.FIREBASE_ANALYTICS.REMOVE_FAVOURITE_SCREEN, { "platform": Platform.OS, "userId": global.userID })
    let deleteFavRequest = {
      data: {
        userId: global.userID,
        documentIds: this.state.removeDocList
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

  componentWillReceiveProps(newProps) {
    if (newProps.navigation && newProps.navigation.getParam("hideTabBar")) {
      this.setState({ isTabBarVisible: false })
      //setTimeout(() => { this.setState({ isTabBarVisible: false }) }, 0)
    }
    else {
      this.setState({ isTabBarVisible: true })
      //setTimeout(() => { this.setState({ isTabBarVisible: true }) }, 0)
    }

    this.setState({
      isConnected: newProps.isConnected
    })

    if (newProps.favouriteDocuments.data) {
      this.setState({
        favouritesData: newProps.favouriteDocuments.data,
        isFetching: false
      }, () => {
        var originalList = [...this.state.favouritesData]
        this.sortAlertList(originalList)
      })

      if (newProps.favouriteDocuments.data.length == 0) {
        this.setState({ isSelectionModeOn: false })
      }
    }
    if (newProps.deleteData !== null) {
      if (newProps.deleteData.error.status === 'success') {
        this.setState({
          removeDocList: [],
          status: newProps.deleteData.error.status,
          message: newProps.deleteData.error.message,
          showNotification: true
        }, () => {
          this.startAnimation()
          this.props.reset()
        })
      } else {
        this.setState({
          status: newProps.deleteData.error.status,
          message: newProps.deleteData.error.message,
          removeDocList: [],
          showNotification: true
        }, () => {
          this.startAnimation()
          this.props.reset()
        })
      }
    }
    this.setState({ loading: newProps.loading })
  }

  showActionSheet = () => {
    if (this.state.removeDocList.length == 0) {
      alert(CONSTANTS.FavouriteScreen.SelectAnyOneDocument)
    }
    else {
      Analytics.logEvent(CONSTANTS.FIREBASE_ANALYTICS.SHARE_CLICK_FAVOURITE, { "platform": Platform.OS, "userId": global.userID })
      this.actionSheet.show()
    }
  }

  getActionSheetRef = ref => (this.actionSheet = ref)

  handlePress = async (index) => {
    const DocumentDir = Platform.OS == 'android' ? await RNFS.ExternalStorageDirectoryPath : await RNFS.DocumentDirectoryPath;
    this.setState({ selectedIndex: index }, () => {
      if (this.state.selectedIndex == 1) {
        Analytics.logEvent(CONSTANTS.FIREBASE_ANALYTICS.PRINT_DOCUMENT, { "platform": Platform.OS, "userId": global.userID, "source": CONSTANTS.FIREBASE_ANALYTICS.FAVORITE_SCREEN })
        this.printRemotePDF(DocumentDir)
      }
      if (this.state.selectedIndex == 0) {
        this.handleEmail()
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

  printRemotePDF = (DocumentDir) => {
    if (this.state.removeDocList.length == 1) {
      let docID = this.state.removeDocList[0]
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
          this.downloadRemotePDF(docID).then((fileLocation) => {
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
    } else {
      setTimeout(() => { alert(CONSTANTS.FavouriteScreen.MultipleDocPrintError) }, 800)
    }
  }

  downloadRemotePDF = (docID) => {
    return new Promise(async (RESOLVE, REJECT) => {

      // var source = this.state.callingFromScreen ? CONSTANTS.FIREBASE_ANALYTICS.ALERT_SCREEN : CONSTANTS.FIREBASE_ANALYTICS.FAVORITE_SCREEN
      //Analytics.logEvent(CONSTANTS.FIREBASE_ANALYTICS.DOCUMENT_VIEW_PDF, { "platform": Platform.OS, "userId": global.userID, "isFavoriteDocument": this.state.isFavourite, "source": source })
      const DocumentDir = Platform.OS == 'android' ? await RNFS.ExternalStorageDirectoryPath : await RNFS.DocumentDirectoryPath;
      if (this.props.isConnected) {
        this.setState({ loading: true, isLoadingForDownload: true })
        this.getPdfFromServer(DocumentDir, docID).then((fileLocation) => {
          if (fileLocation) {
            Database.addPdfLocation(docID, fileLocation, global.userID).then(() => {
              this.setState({ loading: false, isLoadingForDownload: false }, () => {
                RESOLVE(fileLocation)
              })
            })
          } else {
            this.setState({ loading: false, isLoadingForDownload: false }, () => {
              REJECT("")
            })
            alert(CONSTANTS.DocumentDetails.DocNotValidError)
          }
        }).catch(() => {
          this.setState({ loading: false, isLoadingForDownload: false }, () => {
            REJECT("")
          })
          alert(CONSTANTS.FavouriteScreen.NotDownloadedErrorPrint)

        })
      } else {
        this.setState({ loading: true })
        Database.retreivePDFLocation(docID, global.userID).then((res) => {
          this.setState({ loading: false }, () => {
            if (res) {
              RESOLVE(res)
            } else {
              REJECT("")
              alert(CONSTANTS.DocumentDetails.DocNotValidError)
            }
          })
        }).catch(() => {
          this.setState({ loading: false }, () => {
            REJECT("")
          })
          alert(CONSTANTS.FavouriteScreen.NotDownloadedErrorPrint)
        })
      }
    })
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

  handleEmail = async () => {
    var docList = this.state.removeDocList
    var url = []
    Analytics.logEvent(CONSTANTS.FIREBASE_ANALYTICS.EMAIL_DOCUMENT, { "platform": Platform.OS, "userId": global.userID, "source": CONSTANTS.FIREBASE_ANALYTICS.ALERT_DETAIL_SCREEN, "containsMultipleDocuments": docList.length >= 1 ? true : false })

    for (let i = 0; i < docList.length; i++) {
      url.push(EmailDocumentUrl + docList[i] + "\n")
    }
    var emailBody = CONSTANTS.FavouriteScreen.emailText + url.join("")

    sendEmail(CONSTANTS.FavouriteScreen.EmailSubject, emailBody).then(() => {
      console.log('Our email successful provided to device mail ');
    });

    // Mailer.mail({
    //   subject: CONSTANTS.FavouriteScreen.EmailSubject,
    //   recipients: [''],
    //   ccRecipients: [''],
    //   bccRecipients: [''],
    //   body:emailBody,
    //   isHTML: true,

    // }, (error, event) => {
    //   if (error === 'not_available') error = CONSTANTS.FavouriteScreen.EmailClientNAError;
    //   if (event === 'cancelled') event = CONSTANTS.FavouriteScreen.EmailSendingFailedError;
    //   else if (event === 'sent') event = CONSTANTS.FavouriteScreen.EmailSent;

    // })
  }




  /*makeZipArchiveAndAttach = (DocumentDir) => {
    let nonDownloadedDocs = []
    let updatedDocList = []
    let totalSizeOfFiles = 0
    const targetPath = `${DocumentDir}/` + CONSTANTS.FavouriteScreen.ZipName
    var temp_path = DocumentDir + "/temp_folder/"

    var promiseArray = []
    var promiseArray2 = []
    RNFS.mkdir(temp_path);
    this.state.removeDocList.map((item) => {
      promiseArray.push(this.getPdfFromFileDirectoryOrDownload(DocumentDir, item))
    })

    Promise.all(promiseArray).then((results) => {
      results.map(item_path => {
        if (item_path != '') {
          promiseArray2.push(RNFS.exists(item_path))
          updatedDocList.push(item_path)
        }
        else {
          nonDownloadedDocs.push(item_path)
        }
      })
      if (nonDownloadedDocs.length == 0) {
        if (updatedDocList.length <= Number(CONSTANTS.MAX_DOWNLOAD_LIMIT)) {
          Promise.all(promiseArray2).then(async (result2) => {
            for (let i = 0; i < result2.length; i++) {

              if (result2[i]) {
                await RNFS.readFile(updatedDocList[i]).then(file => {
                  var tempLocation = ''
                  var stringToBeSplit = "data:application/pdf;base64,"
                  var Base64Code = file.split(stringToBeSplit)
                  tempLocation = temp_path + '/' + "RegulatoryDoc_" + i + ".pdf";
                  RNFetchBlob.fs.writeFile(tempLocation, Base64Code[1], 'base64').then(() => {
                    RNFetchBlob.fs.readFile(tempLocation, 'base64')
                      .then((data) => {
                        var decodedData = base64.decode(data);
                        var bytes = decodedData.length;
                        if (bytes < 1073741824)
                          console.log("MB:" + (bytes / 1048576).toFixed(2) + " MB");
                        totalSizeOfFiles = totalSizeOfFiles + (bytes / 1048576).toFixed(2)
                      })
                  })
                }).catch((error) => {
                  console.log(error)
                  this.setState({ loading: false })
                })
              }

              if (i == result2.length - 1) {
                if (totalSizeOfFiles <= Number(CONSTANTS.MAX_DOWNLOAD_LIMIT)) {
                  await zip(temp_path, targetPath).then((path) => {
                    Mailer.mail({
                      subject: CONSTANTS.FavouriteScreen.EmailSubject,
                      recipients: [''],
                      ccRecipients: [''],
                      bccRecipients: [''],
                      body: CONSTANTS.FavouriteScreen.EmailBody,
                      isHTML: true,
                      attachment: {
                        path: path,
                        type: 'zip',
                        name: CONSTANTS.FavouriteScreen.ZipName,
                      }
                    }, (error, event) => {
                      if (error === 'not_available') error = CONSTANTS.FavouriteScreen.EmailClientNAError;
                      if (event === 'cancelled') event = CONSTANTS.FavouriteScreen.EmailSendingFailedError;
                      else if (event === 'sent') event = CONSTANTS.FavouriteScreen.EmailSent;

                      for (let r = 0; r < updatedDocList.length; r++) {
                        RNFS.exists(temp_path + '/' + "RegulatoryDoc_" + r + ".pdf").then((result) => {
                          if (result) {
                            return RNFS.unlink(temp_path + '/' + "RegulatoryDoc_" + r + ".pdf")
                              .then(() => {
                              })
                              .catch((err) => {
                                console.log(err.message);
                              });
                          }
                        })
                      }
                      Alert.alert(
                        error,
                        event,
                        [
                          { text: 'Ok', onPress: () => { this.setState({ loading: false }) } },
                          { text: 'Cancel', onPress: () => { this.setState({ loading: false }) } }
                        ],
                        { cancelable: true }
                      )
                    });
                  }).catch((error) => {
                    console.log(error)
                    this.setState({ loading: false })
                  })
                }
                else {
                  alert(CONSTANTS.FavouriteScreen.LessThanSixSizeError)
                }
              }
            }
          }).catch((err) => {
            this.setState({ loading: false })
            alert(CONSTANTS.FavouriteScreen.NotDownloadedError)
          })
        }
        else {
          alert(CONSTANTS.FavouriteScreen.LessThanSixError)
        }
      }
      else {
        this.setState({ loading: false })
        alert(CONSTANTS.FavouriteScreen.NotDownloadedError)
      }
    }).catch((err) => {
      this.setState({ loading: false })
      alert(CONSTANTS.FavouriteScreen.NotDownloadedError)
    })
    if (this.state.loading) {
      this.setState({ loading: false })
    }
  }*/
  renderTopHeader = () => {
    return (
      <View style={{ flexDirection: 'column' }}>
        <View style={styles.headerview}>
        <Text style={[styles.leftTextView]}>{this.state.favouritesData.length} {(this.state.favouritesData.length > 1 ? 'favorites' : 'favorite')}</Text>
          <TouchableOpacity onPress={() => {
            if (this.state.favouritesData.length > 0) {
              this.setState({ showSortView: !this.state.showSortView })
            }
          }}>
            <Text style={styles.rightTextView}>Sort</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.sepview}>
        </View>
      </View>
    )
  }

  onSelection = (selected, documentId) => {
    if (selected) {
      var found = this.state.removeDocList.find(function (element) {
        return element == documentId
      });
      if (found == undefined) {
        var existingDocList = this.state.removeDocList
        existingDocList.push(documentId)
        this.setState({
          removeDocList: existingDocList,
        })
      }
    }
    else {
      var index = this.state.removeDocList.indexOf(documentId)
      if (index > -1) {
        var existingDocList = this.state.removeDocList
        existingDocList.splice(index, 1);
        this.setState({
          removeDocList: existingDocList
        })
      }
    }
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
          <View style={[styles.layoutview]}>
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
              <View style={[styles.sortSepView, { backgroundColor: '#F6F7F9' }]} />

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
              <View style={[styles.sortSepView, { backgroundColor: '#F6F7F9' }]} />
              <RoundedBlueButton
                text={CONSTANTS.APPLY}
                blueButtonStyle={styles.roundedButtonStyle}
                textStyle={styles.textStyle}
                onPress={() => {
                  this.sortAlertList(this.state.favouritesData)
                  this.setState({ showSortView: !this.state.showSortView })
                  var sortedOption = this.state.nameCheckboxValue ? CONSTANTS.FIREBASE_ANALYTICS.SORTED_BY_NAME : CONSTANTS.FIREBASE_ANALYTICS.SORTED_BY_DATE
                  Analytics.logEvent(CONSTANTS.FIREBASE_ANALYTICS.SORTING_CHANGES_FAVOURITE, { "platform": Platform.OS, "userId": global.userID, "sortedBy": sortedOption })
                }}>
              </RoundedBlueButton>
            </SafeAreaView>
          </View>
        </View>
      </Modal>
    )
  }

  sortAlertList(list) {
    let sortedList = [...list]
    if (this.state.favouritesData.length > 0) {
      if (this.state.nameCheckboxValue) {
        sortedList.sort(function (a, b) {
          if (a.regulatorySnapshotOutput.title.toLowerCase() > b.regulatorySnapshotOutput.title.toLowerCase()) {
            return 1;
          }
          if (b.regulatorySnapshotOutput.title.toLowerCase() > a.regulatorySnapshotOutput.title.toLowerCase()) {
            return -1;
          }
          return 0;
        });
      }
      else {
        sortedList.sort((a, b) => new Moment(b.regulatorySnapshotOutput.updatedDate).format('YYYYMMDD') - new Moment(a.regulatorySnapshotOutput.updatedDate).format('YYYYMMDD'))
      }
    }
    this.setState({ favouritesData: sortedList })
  }

  onRefresh = () => {
    this.setState({ isFetching: true })
    this.getFavourites()
  }

  renderListData = () => {
    const isEditModeOn = this.state.isSelectionModeOn;
    if (isEditModeOn) {
      return (
        <View style={styles.flatview}>
          <FlatList
            data={this.state.favouritesData}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={this.renderSeparator}
            // extraData={this.state.removeDocList}
            keyExtractor={(item, index) => item.idrac}
            onRefresh={() => this.onRefresh()}
            refreshing={this.state.isFetching}
            initialNumToRender={10}
            renderItem={this.renderItemInEditableMode}
            removeClippedSubviews={true}
          />
        </View>
      )
    }
    else {
      return (
        <FlatList
          data={this.state.favouritesData}
          //style={styles.flatview}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={this.renderSeparator}
          // extraData={this.state.removeDocList}
          keyExtractor={(item, index) => item.idrac}
          onRefresh={() => this.onRefresh()}
          refreshing={this.state.isFetching}
          initialNumToRender={10}
          renderItem={this.renderItem}
          removeClippedSubviews={true}
        />
      )
    }
  }

  renderItem = ({ item }) => (
    <FavouriteListRow
      item={item}
      onPressed={() => { this.onFavouriteDocumentClicked(item) }}
    />);

  renderItemInEditableMode = ({ item }) => (
    <FavouriteListRowSelectable
      item={item}
      onSelection={(selected, documentId) => { this.onSelection(selected, documentId) }}
      isSelected={this.state.removeDocList.indexOf(item.idrac) !== -1}
    />);

  onFavouriteDocumentClicked = (item) => {
    if (!this.state.isSelectionModeOn) {
      this.props.navigation.navigate('DocumentScreen', {
        DocumentData: item,
        CallingFrom: "Fav"
      });
    }
  }

  renderSeparator = () => {
    return (
      <View style={styles.separatorview} />
    );
  };


  startAnimation = () => {
    Animated.timing(this.state.presentAnimation, {
      toValue: 1,
      duration: 500,
      delay: 0,
      useNativeDriver: true
    }).start(() => {
      setTimeout(() => {
        if (this.state.favouritesData.length == 0) {
          this.props.navigation.setParams({ hideTabBar: false })
        }
      }, 1000);
      setTimeout(() => {
        this.setState({ showNotification: !this.state.showNotification })
      }, notificationDuration);
    });
  }

  render() {
    let bottomBarTranslateY = this.state.presentAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [-100, 0]
    })
    const isSelectionModeOn = this.state.isSelectionModeOn;
    const favouritesData = this.state.favouritesData;
    const favouritesDataLength = favouritesData.length;
    return (
      <View style={styles.container}>

        {/* <NavigationEvents
          onWillFocus={payload => {
            {<OfflineNotice ConnectionStatus={this.props.isConnected} />}
            console.log("will focus", payload);
            alert("will focus", payload);
          }} 
          
        />*/}
        {(this.props.loading || this.state.loading) && (
          <View style={styles.loading}>
            <ActivityIndicator color="white" size="large" />
            {this.state.isLoadingForDownload ?
              <Text style={{ color: "white", fontFamily: fonts.SourceSansProBold, fontSize: Normalize(16) }}>Downloading...</Text>
              :
              <Text style={{ color: "white", fontFamily: fonts.SourceSansProBold, fontSize: Normalize(16) }}>Loading...</Text>}
          </View>
        )}

        {this.state.showNotification && (
          <Animated.View style={{ position: 'absolute', width: '100%', zIndex: 2, transform: [{ translateY: bottomBarTranslateY }] }}>
            {this.state.showNotification != "" && <NotificationAlertView BGColor={this.state.status == 'success' ? COLOR.GREEN_SUCCESS : COLOR.PINK} titleviewstyle={[styles.titleviewstyle, { backgroundColor: this.state.status == 'success' ? COLOR.GREEN_SUCCESS : COLOR.PINK }]} headerstyle={styles.headerstyle} title={this.state.message}></NotificationAlertView>}

          </Animated.View>
        )}
        <RenderScreenHeader
          action={isSelectionModeOn ? CONSTANTS.DONE : CONSTANTS.SELECT}
          showActionButton={favouritesData.length > 0 ? true : false}
          nextAction={() => {
            this.setState({ isSelectionModeOn: !isSelectionModeOn, removeDocList: [] }, () => {
              this.props.navigation.setParams({ hideTabBar: this.state.isSelectionModeOn })
            })

            // setTimeout(() => {
            //   this.setState({ isSelectionModeOn: !isSelectionModeOn, removeDocList: [] })
            // }, 200)

            // setTimeout(() => {
            //   this.props.navigation.setParams({ hideTabBar: !isSelectionModeOn })
            // }, 200)
          }} />

        {favouritesDataLength > 0 && (this.renderTopHeader())}

        {favouritesDataLength > 0 && this.renderListData()}
        {favouritesDataLength == 0 && !this.props.loading && (<EmptyListDisplay />)}
        {this.state.showSortView && (this.sortView())}
        {/* {this.state.favouritesData.length > 0 ? (
          this.renderListData()
        ) : <EmptyListDisplay />} */}

        <ActionSheet
          ref={this.getActionSheetRef}
          //title={<Text style={{ color: COLOR.GRAY_TEXT, fontSize: Normalize(18) }}>Sharing with</Text>}
          //titleHeight={NormalizeLayout(60)}
          options={options}
          cancelButtonIndex={2}
          destructiveButtonIndex={2}
          onPress={this.handlePress}
        />

        {!this.state.isTabBarVisible &&
          (<SafeAreaView style={[styles.SafeAreaViewTop, { backgroundColor: '#fff' }]} >
            <BottomBar
              showItems={2}
              isNetConnected={this.state.isConnected}
              isFavEnabled={this.state.removeDocList.length != 0}

              tab2Text={CONSTANTS.SHARE} 
              tab2SelectionColor={COLOR.LIGHT_GRAY_TEXT}
              tab2UnSelectionColor={COLOR.LIGHT_GRAY_TEXT}

              tab1Text={CONSTANTS.REMOVE}
              tab1SelectionColor={COLOR.THEME_COLOR}
              tab1UnSelectionColor={COLOR.THEME_COLOR}
              tab1Image={<SvgFilledStar fill={COLOR.THEME_COLOR} />}
              tab1SelectedImage={<SvgFilledStar fill={COLOR.THEME_COLOR} />}

              tab2Image={<SvgShare fill={COLOR.LIGHT_GRAY_TEXT} />}
              tab2SelectedImage={<SvgShare fill={COLOR.LIGHT_GRAY_TEXT} />}
              onTab1Press={(isSelected) => { (isSelected) && this.props.isConnected && this.deleteFavourites() }}
              onTab2Press={() => { this.showActionSheet() }}
            />
          </SafeAreaView>)}
        <OfflineNotice ConnectionStatus={this.props.isConnected} />
      </View>
    )
  }
}

const RenderScreenHeader = (props) => {
  return (
    <SafeAreaView style={styles.SafeAreaViewTop} >
      <NavigationHeader showActionButton={props.showActionButton} title={'Favorites'} action={props.action} actionPress={props.nextAction}></NavigationHeader>
    </SafeAreaView>
  )
}



const EmptyListDisplay = (props) => {
  return (
    <View style={{ flex: 1, marginLeft: NormalizeLayout(15), marginRight: NormalizeLayout(15), justifyContent: 'center', alignItems: 'center' }}>
      <SvgStar2 />
      <View style={{ marginTop: NormalizeLayout(36) }}>
        <Text style={styles.emptyText}>{CONSTANTS.FavouriteScreen.EmptyFavListLabel1} </Text>
        <Text style={[styles.emptyText, { marginTop: NormalizeLayout(15) }]}>{CONSTANTS.FavouriteScreen.EmptyFavListLabel2} </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  emptyText: {
    fontFamily: fonts.SourceSansProRegular,
    fontSize: Normalize(16),
    textAlign: 'center',
    color: COLOR.GRAY_TEXT
  },
  flatview: {
    flex: 1
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
  mainview: {
    flexDirection: 'column',
    flex: 1
  },
  headerview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F6F7F9',
    alignItems: 'center',
    height: NormalizeLayout(60)
  },
  leftTextView: {
    marginTop: NormalizeLayout(20),
    marginBottom: NormalizeLayout(20),
    marginLeft: NormalizeLayout(20),
    fontSize: Normalize(16),
    fontFamily: fonts.SourceSansProBold,
    color: '#555555',
  },
  rightTextView: {
    marginTop: NormalizeLayout(20),
    marginBottom: NormalizeLayout(20),
    marginRight: NormalizeLayout(20),
    fontSize: Normalize(16),
    color: '#555555'
  },
  separatorview: {
    backgroundColor: '#E1E4E6',
    height: 1,
    width: "100%",

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
  },
  layoutview: {
    flexDirection: 'column',
    height: '40%',
    zIndex: 3,
    backgroundColor: COLOR.WHITE,

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
    lineHeight: NormalizeLayout(20)
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
  sortHeader: {
    color: COLOR.LIGHT_GRAY_TEXT,
    fontSize: Normalize(16),
    height: Normalize(20),
    fontFamily: fonts.SourceSansProBold,
    marginLeft: NormalizeLayout(16),
    marginRight: NormalizeLayout(16),

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
    height: '100%',
    zIndex: 1
  },

});

/*
  Bind state and dispatch actions to props
  */
const mapStateToProps = (state) => ({
  loading: state.favouritesData.loading,
  favouriteDocuments: state.favouritesData.favouriteDocuments,
  deleteData: state.favouritesData.deleteData,
  errorMessage: state.favouritesData.errorMessage,
  isConnected: state.offlineReducer.isConnected,
});

const mapDispatchToProps = dispatch => {
  return {
    getFavourites: (token, userId) => { dispatch(fetchFavourites(token, userId)); },
    getFavouritesFromLocalDatabase: (userId) => { dispatch(getFavouritesFromLocalDatabase(userId)); },
    deleteFavouritesDispatch: (token, params, userId) => { dispatch(deleteFavouritesDispatch(token, params, userId)); },
    reset: () => { dispatch({ type: 'RESET_FAV' }) }

  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FavouritesScreen)