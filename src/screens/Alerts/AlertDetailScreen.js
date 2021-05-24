import React from 'react';
import { Text, View, SectionList, StyleSheet, ActivityIndicator, SafeAreaView, Platform, Alert, Animated, TouchableWithoutFeedback, PermissionsAndroid, BackHandler } from 'react-native';
import  AsyncStorage  from "@react-native-community/async-storage";
import { COLOR } from '../../constants/Colors'
import { Normalize, NormalizeLayout } from '../../utils/Scale'
import { CONSTANTS } from '../../constants/Constants'
import { connect } from "react-redux";
import { requestPerson, connectionState } from "../../actions/OfflineActions";

import NavigationHeader from '../../utils/NavigationHeader';
import fonts from '../../utils/CortellisFonts'
import RNFetchBlob from 'react-native-fetch-blob';
import RNPrint from 'react-native-print';
// import Mailer from 'react-native-mail';
import RNFS from 'react-native-fs';
import SvgCalendar from '../../../assets/svgimage/Calendar.js'
import SvgStar from '../../../assets/svgimage/Star5'
import SvgShare from '../../../assets/svgimage/Share';
//import CortellisButton from '../../utils/CortellisActionButton'

import FavouriteListRow from '../Favourites/FavouriteListRow'
import FavouriteListRowSelectable from '../Favourites/FavouriteListRowSelectable'
import BottomBar from '../../utils/BottomBar'
import ActionSheet from '../../utils/CustomActionSheet/ActionSheet'
import SvgEditAlert from '../../../assets/svgimage/EditAlert.js'
import { addDocToFavourites , updateAndFetchNotificationFromDB, fetchAlerts} from '../../actions/AlertActions'
import NotificationAlertView from '../../utils/NotificationAlertView'
import moment from 'moment'
import OfflineNotice from '../../utils/OfflineNotice'
import firebase from 'react-native-firebase'
let Analytics = firebase.analytics();
import NotificationNotice from '../../utils/NotificationNotice'
// import { zip } from 'react-native-zip-archive'
import { Database } from '../../utils/DatabaseHelper'
import { BaseURL, EmailDocumentUrl } from '../../configurations/configurations'
import { sendEmail } from '../../utils/Utility'


const options = [
    'Email',
    'Print',
    {
        component: <Text style={{ color: COLOR.YELLOW, fontSize: 20, fontFamily: Platform.OS == 'ios' ? fonts.SourceSansProSemibold : fonts.SourceSansProBold }}>Cancel</Text>
    },
]
const notificationDuration = 3000

var isValid = (value) => !(value == undefined || value == 'null' || value == null || value == '' || value == 'undefined')


class AlertDetailScreen extends React.Component {
    static navigationOptions = {
        headerShown: false,
        tabBarVisible: true
    };

    constructor(props) {
        super(props);
        const map = new Map();
        this.state =
            {
                isSelectionModeOn: false,
                selectedIndex: 0,
                addDocList: [],
                presentAnimation: new Animated.Value(0),
                showNotification: false,
                status: '',
                message: '',
                isCheckEnable: false,
                loading: false,
                isLoadingForDownload: false,
                hasAPIFailed: false,
                updatedAlertName: '',
                isConnected: false,
                memberOpened: map,
                comingFromNotificationFlow: this.props.navigation.getParam("isComingFromNotification", false) ? true : false,
                notificationData: []
            }

        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
        // alert("section-data in Alert details",this.state.section.data.toString())
        //this.notificationData = []
    }
    componentWillReceiveProps(newProps) {
        if (this.state.hasAPIFailed === true) {
            this.setState({
                hasAPIFailed: false
            })
        }
        this.setState({
            isConnected: newProps.isConnected
        })
    }
    componentDidMount() {
       //add service call here for the specific notification id
       if(this.state.comingFromNotificationFlow){
           //assumptions :- uuid passed in the navigation parameters
           // const uuid = this.props.navigation.getParam("uuid")
           // hard coding message id
           const uuid = this.props.navigation.getParam("uuid" )
           AsyncStorage.getItem('userToken', (err, result) => {
            if (err) {
            }
            else {
                if (result == null) {
                }
                else {
                    this.setState({ loading: true, isLoadingForDownload: false })
                    updateAndFetchNotificationFromDB(result, uuid, global.userID).then((res) => {
                        notificationData = res.notifications.reduce((r, s) => {
                            if (s.documents.length > 0) {
                                r.push({ title: { "date": s.notificationDate, "notificationID": s.notificationId }, data: s.documents });
                            }
                            return r;
                        }, []);
                        this.setState({notificationData : notificationData , notificationAlertID:res.alertId, notificationAlertName: res.alertName, notificationCategoryName: res.prodCategories , section: res.notifications, loading: false, isLoadingForDownload: false})
                    }).catch((err) => {
                        alert("Something went wrong.")
                    })
                }}
            })   
       }else{
           let sectionData = this.props.navigation.getParam('Alert').notifications
        notificationData = sectionData.reduce((r, s) => {
            if (s.documents.length > 0) {

                r.push({ title: { "date": s.notificationDate, "notificationID": s.notificationId }, data: s.documents });
            }
            return r;
        }, []);
        this.setState({notificationData : notificationData, section: sectionData})

       }
    }

    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    componentWillUnmount() {
        // BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    _handleConnectionChange = (isConnected) => {
        this.setState({ isConnected: isConnected });
    }

    handleBackButtonClick() { 
        this.state.comingFromNotificationFlow ? this.props.navigation.state.params.onGoBack(() => {
            AsyncStorage.getItem('userToken', (err, result) => {
                if (err) {
                } else {
                  if (result == null) {
                  } else {
                    this.props.getAlerts(result, global.userID)
                  }
                }
              });
        }) :  this.props.navigation.state.params.onGoBack()
        this.props.navigation.goBack(null);
        return true;
    }

    timeDifference = (current, previous) => {
        var msPerMinute = 60 * 1000;
        var msPerHour = msPerMinute * 60;
        var msPerDay = msPerHour * 24;
        var msPerMonth = msPerDay * 30;
        var msPerYear = msPerDay * 365;

        var elapsed = current - previous;

        // if (elapsed < msPerMinute) {
        //     return Math.round(elapsed / 1000) + ' seconds ago';
        // }

        // else if (elapsed < msPerHour) {
        //     return Math.round(elapsed / msPerMinute) + ' minutes ago';
        // }
        if (elapsed < msPerDay) {
            return 'TODAY';
        }

        else if (elapsed < msPerMonth) {
            if (Math.round(elapsed / msPerDay) == 1) {
                return Math.round(elapsed / msPerDay) + ' DAY AGO';
            }
            else {
                return Math.round(elapsed / msPerDay) + ' DAYS AGO';
            }
        }

        else if (elapsed < msPerYear) {
            if (Math.round(elapsed / msPerMonth) == 1) {
                return Math.round(elapsed / msPerMonth) + ' MONTH AGO';
            }
            else {
                return Math.round(elapsed / msPerMonth) + ' MONTHS AGO';
            }
        }

        else {
            return Math.round(elapsed / msPerYear) + ' YEAR AGO';
        }
    }

    addDocToFavourites = async () => {
        Analytics.logEvent(CONSTANTS.FIREBASE_ANALYTICS.FAVOURITE_CLICK_ALERT_DETAIL, { "platform": Platform.OS, "userId": global.userID })
        this.setState({ loading: true })

        let targetDocuments = []
        let sections = this.state.section
        let favoriteDocuments = this.state.addDocList
        sections.map(notification => {
            var shouldProcessNotification = false
            for (var index in favoriteDocuments) {
                let element = favoriteDocuments[index]
                if (element.notificationId == notification.notificationId) {
                    shouldProcessNotification = true
                    break
                }
            }

            // var element = favoriteDocuments.map((element) => {
            //     return element.notificationId == notification.notificationId
            // })
            if (shouldProcessNotification) {
                notification.documents.filter(document => {
                    // identify documents in this notification and add to target documents
                    var documentIsSelected = favoriteDocuments.find(currentDocument => { return currentDocument.documentId == document.idrac })
                    if (documentIsSelected != undefined) {
                        targetDocuments.push(document)
                    }
                })
            }
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
                                this.setState({
                                    status: res.status,
                                    message: res.message,
                                    addDocList: [],
                                    showNotification: true,
                                    loading: false
                                }, () => {
                                    this.startAnimation()
                                })

                            }
                            else {
                                this.setState({
                                    status: res.status,
                                    message: res.message,
                                    addDocList: [],
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

    showActionSheet = () => {
        if (this.state.addDocList.length == 0) {
            alert(CONSTANTS.FavouriteScreen.SelectAnyOneDocument)
        }
        else {
            Analytics.logEvent(CONSTANTS.FIREBASE_ANALYTICS.SHARE_CLICK_ALERT_DETAIL, { "platform": Platform.OS, "userId": global.userID })
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


    renderItem = ({ item, section }) => {
        return (
            <FavouriteListRow
                item={item}
                onPressed={() => { this.onDocumentSelection(item , section) }}
            />);
    }


    renderItemInEditableMode = ({ item, section }) => {
        const filteredItems = this.state.addDocList.filter(element => {
            return (element.notificationId == section.title.notificationID && element.documentId == item.idrac)
        })
        return (
            <FavouriteListRowSelectable
                item={item}
                onSelection={(selected, documentId) => { this.onDocumentSelectionInEditMode(selected, documentId, section) }}
                isSelected={filteredItems.length > 0}
            />);
    }

    onDocumentSelectionInEditMode = (selected, documentId, section) => {
        var selectedObject = {
            notificationId: section.title.notificationID,
            documentId: documentId
        }

        if (selected) {
            var found = this.state.addDocList.find(function (element) {
                return (element.notificationId == selectedObject.notificationId) &&
                    (element.documentId == selectedObject.documentId);
            });
            if (found == undefined) {
                var existingDocList = this.state.addDocList
                existingDocList.push(selectedObject)
                this.setState({
                    addDocList: existingDocList,
                })
            }
        }
        else {
            var copiedArray = [...this.state.addDocList]
            var filteredArray = copiedArray.filter(element => {
                return (element.documentId !== selectedObject.documentId ||
                    element.notificationId !== selectedObject.notificationId)
            })

            this.setState({
                addDocList: filteredArray
            })
        }
    }

    onDocumentSelection = (item , section) => {
        this.props.navigation.navigate("DocumentScreen", { DocumentData: item, CallingFrom: "Alert" , notificationID: section.title.notificationID})
    }

    getDateFromTimestamp = (timestamp) => {
        let spaceIndex = timestamp.indexOf(' ')
        if (spaceIndex != -1) {
            timestamp = timestamp.substring(0, spaceIndex)
        }
        return timestamp
    }

    renderSectionHeaderComponent = ({ section }) => {
        var date = new Date();
        var todate = moment.utc(section.title.date , 'DD-MMM-YY hh:mm a')
        var local = todate.local().format('DD MMMM YYYY');
        var todayText = this.timeDifference(date, todate.local())
        return (
            <SectionHeader day={todayText} date={local} />
        )

    }

    renderEndReached = () => {
        this.setState({ isEndReached: true })
    }

    FlatListItemSeparator = () => {
        return (
            //Item Separator
            <View style={{ height: 0.5, width: '100%', backgroundColor: COLOR.Gray_Sep }} />
        );
    };

    ListHeader = (AlertName, ProdCateg) => {
        return (
            // <View style={{ paddingBottom: NormalizeLayout(15) }}>
            <View >
                <AlertTitleHeader smallHeader={AlertName} titleHeader={ProdCateg} onEditModePress={() => { this.onEditMode() }} />
            </View>
        );
    };

    ListNotificationHeader = (AlertName, ProdCateg) => {
        if(isValid(AlertName)){
            return (
                <View >
                    <AlertTitleHeader smallHeader={AlertName} titleHeader={ProdCateg} onEditModePress={() => { this.onEditMode() }} />
                </View>
            
            );
        }else {
            return null
        }
    
    };

    loadMoreData = () => {
        this.setState({ section: [...this.state.section, ...additionalSection] });
    }

    onEditMode = () => {
        Analytics.logEvent(CONSTANTS.FIREBASE_ANALYTICS.EDIT_ALERT, { "platform": Platform.OS })

        this.props.navigation.navigate('CreateAlert', {
            mode: 'edit',
            alertTitle: this.returnAlertTitle(),
            alertId: this.state.comingFromNotificationFlow ? this.state.notificationAlertID : this.props.navigation.getParam('Alert').alertId,
            updateAlertName: (alertName) => {
                this.setState({ updatedAlertName: alertName })
            }
        });
    }

    returnAlertTitle = () => {
        if(this.state.comingFromNotificationFlow){
            if( this.state.updatedAlertName != '') {
                return this.state.updatedAlertName 
            }else{     
                if(this.state.notificationAlertName){
                    return this.state.notificationAlertName
                }else{
                    return ''
                }
            }
        }else{
            if( this.state.updatedAlertName != '') {
                return this.state.updatedAlertName 
            }else{
                if( this.props.navigation.getParam('Alert').alertName){
                    return  this.props.navigation.getParam('Alert').alertName
                }else{
                    return ''
                }
            }
        }
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
        if (this.state.addDocList.length == 1) {
            let docID = this.state.addDocList[0].documentId;
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
        var docList = []
        var url = []

        for (let item of this.state.addDocList) {
            let filteredArray = docList.filter(object => object.documentId == item.documentId)
            if (filteredArray.length == 0) {
                docList.push(item)
            }
        }

        Analytics.logEvent(CONSTANTS.FIREBASE_ANALYTICS.EMAIL_DOCUMENT, { "platform": Platform.OS, "userId": global.userID, "source": CONSTANTS.FIREBASE_ANALYTICS.ALERT_DETAIL_SCREEN, "containsMultipleDocuments": docList.length >= 1 ? true : false })

        for (let i = 0; i < docList.length; i++) {
            url.push(EmailDocumentUrl + docList[i].documentId + "\n")
        }
        var emailBody = CONSTANTS.FavouriteScreen.emailText + url.join("")

        sendEmail(CONSTANTS.FavouriteScreen.EmailSubject, emailBody).then(() => {
            console.log('Our email successful provided to device mail ');
        });

    }


    render() {
        let bottomBarTranslateY = this.state.presentAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [-100, 0]
        })
        const { navigation } = this.props;
        const Alert = navigation.getParam('Alert');
        return (
            <View style={styles.container}>
                {this.state.loading && (
                    <View style={styles.loading}>
                        <ActivityIndicator color="white" size="large" />
                        {this.state.isLoadingForDownload ?
                            <Text style={{ color: "white", fontFamily: fonts.SourceSansProBold, fontSize: Normalize(16) }}>Downloading...</Text>
                            :
                            <Text style={{ color: "white", fontFamily: fonts.SourceSansProBold, fontSize: Normalize(16) }}>Loading...</Text>}
                    </View>
                )}
                <ActionSheet
                    ref={this.getActionSheetRef}
                    //title={<Text style={{ color: COLOR.GRAY_TEXT, fontSize: Normalize(18) }}>Sharing with</Text>}
                    //titleHeight={NormalizeLayout(60)}
                    options={options}
                    cancelButtonIndex={2}
                    destructiveButtonIndex={2}
                    onPress={this.handlePress}
                />
                {this.state.showNotification && (
                    <Animated.View style={{ position: 'absolute', width: '100%', zIndex: 2, transform: [{ translateY: bottomBarTranslateY }] }}>
                        {this.state.showNotification != "" && <NotificationAlertView BGColor={this.state.status == 'success' ? COLOR.GREEN_SUCCESS : COLOR.PINK} titleviewstyle={[styles.titleviewstyle, { backgroundColor: this.state.status == 'success' ? COLOR.GREEN_SUCCESS : COLOR.PINK }]} headerstyle={styles.headerstyle} title={this.state.message}></NotificationAlertView>}

                    </Animated.View>
                )}

                {(this.state.hasAPIFailed) && (
                    <NotificationNotice status={'Fail'} displayText={"Something went wrong."} />
                )}
                <RenderScreenHeader
                    action={this.state.isSelectionModeOn ? CONSTANTS.DONE : CONSTANTS.SELECT}
                    notificationData={this.state.notificationData}
                    backPress={() => { this.state.comingFromNotificationFlow ? this.props.navigation.state.params.onGoBack(() => {
                        AsyncStorage.getItem('userToken', (err, result) => {
                            if (err) {
                            } else {
                              if (result == null) {
                              } else {
                                this.props.getAlerts(result, global.userID)
                              }
                            }
                          });
                    }) :  this.props.navigation.state.params.onGoBack(); this.props.navigation.goBack() }}
                    nextAction={() => {
                        this.setState({ addDocList: [] })
                        this.setState({ isSelectionModeOn: !this.state.isSelectionModeOn }, () => {
                            if (this.state.isSelectionModeOn) {
                                this.props.navigation.setParams({ hideTabBar: true })
                            }
                            else {
                                this.props.navigation.setParams({ hideTabBar: false })
                            }
                        })
                    }}
                />

                <View style={{ flex: 2, justifyContent: 'center', alignItems: 'center' }}>
                    <SectionList
                        sections={this.state.notificationData}
                        ListHeaderComponent={this.state.comingFromNotificationFlow ? this.ListNotificationHeader(this.state.notificationCategoryName , this.state.updatedAlertName != '' ? this.state.updatedAlertName : this.state.notificationAlertName) : this.ListHeader(Alert.prodCategories, this.state.updatedAlertName != '' ? this.state.updatedAlertName : Alert.alertName)}
                        renderItem={this.state.isSelectionModeOn ? this.renderItemInEditableMode : this.renderItem}
                        renderSectionHeader={({ section }) => this.renderSectionHeaderComponent({ section })}
                    //  ItemSeparatorComponent={this.FlatListItemSeparator}
                    //  ListFooterComponent={this.renderFooter.bind(this)}
                    />
                </View>

                {this.state.isSelectionModeOn && (
                    <SafeAreaView style={[styles.SafeAreaViewTop, { backgroundColor: '#fff' }]} >
                        <BottomBar
                            showItems={2}
                            isNetConnected={this.state.isConnected}
                            isFavEnabled={this.state.addDocList.length != 0}

                            tab1Text={CONSTANTS.FAVOURITE}
                            tab2Text={CONSTANTS.SHARE}

                            tab2SelectionColor={COLOR.LIGHT_GRAY_TEXT}
                            tab2UnSelectionColor={COLOR.LIGHT_GRAY_TEXT}

                            tab1Image={<SvgStar fill={COLOR.LIGHT_GRAY_TEXT} />}
                            tab1SelectedImage={<SvgStar fill={COLOR.THEME_COLOR} />}

                            tab2Image={<SvgShare fill={COLOR.LIGHT_GRAY_TEXT} />}
                            tab2SelectedImage={<SvgShare fill={COLOR.LIGHT_GRAY_TEXT} />}

                            onTab1Press={(isSelected) => { (isSelected) && this.props.isConnected && this.addDocToFavourites() }}
                            onTab2Press={() => { this.showActionSheet() }}>

                        </BottomBar>
                    </SafeAreaView>
                )}

                <OfflineNotice ConnectionStatus={this.props.isConnected} />
            </View>
        )
    }
}

const AlertTitleHeader = (props) => {
    return (
        <View style={styles.AlertTitleHeaderView}>
            <View >
                <Text style={[styles.smallHeader, { marginTop: Normalize(17), color: COLOR.LIGHT_GRAY_TEXT }]}>{props.smallHeader}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', paddingLeft: 20, paddingRight: 20 }}>
                    <Text style={[styles.titleHeader]}>{props.titleHeader + '  '}</Text>
                    <TouchableWithoutFeedback onPress={() => { props.onEditModePress() }} >
                        <SvgEditAlert />
                    </TouchableWithoutFeedback>
                    {/* </Text> */}
                </View>
            </View>
        </View>
    )
}

const RenderScreenHeader = (props) => {
    return (
        <SafeAreaView style={styles.SafeAreaViewTop} >
            <NavigationHeader showActionButton={props.notificationData.length > 0 ? true : false} title={CONSTANTS.ALERT} action={props.action} backAction={props.backPress} actionPress={props.nextAction} back={true}></NavigationHeader>
        </SafeAreaView>
    )
}

const SectionHeader = (props) => {
    var daytext = (props.day).toUpperCase();
    return (
        <View>
            <View style={[styles.sepview, { height: NormalizeLayout(1) }]}></View>

            <View style={styles.SectionHeader}>
                <View style={{ position: 'absolute', marginLeft: Normalize(20), marginTop: Normalize(11)}}>
                    <Text style={[styles.smallHeader, { marginTop: NormalizeLayout(2),fontWeight: 'bold', fontSize: Normalize(12) ,lineHeight: NormalizeLayout(15)}]}>{daytext}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'center', height: '100%', width: '100%', alignItems: 'center' }}>
                    <SvgCalendar />
                    <Text style={[styles.smallHeader, { marginLeft: Normalize(10) , lineHeight: NormalizeLayout(18)}]}>{props.date}</Text>
                </View>
            </View>

            <View style={styles.sepview}></View>
        </View>
    )
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    smallHeader: {
        color: COLOR.LIGHT_GRAY_TEXT,
        fontFamily: fonts.SourceSansProRegular,
        fontSize: Normalize(14),
        textAlign: 'center',
    },
    titleHeader: {
        color: COLOR.THEME_COLOR,
        fontFamily: fonts.SourceSansProRegular,
        fontSize: Normalize(22),
        textAlign: 'center'
    },
    AlertTitleHeaderView: {
        // minHeight: NormalizeLayout(120),
        // maxHeight: NormalizeLayout(150),
        width: '100%',
        marginBottom: NormalizeLayout(25)
    },
    SectionHeader: {
        flexDirection: 'row',
        height: NormalizeLayout(40),
        width: '100%',
        backgroundColor: COLOR.TAB_BG_COLOR
    },
    SafeAreaViewTop: {
        backgroundColor: COLOR.HEADER_BG
    },
    sepview: {
        backgroundColor: COLOR.Gray_Sep,
        height: Normalize(2),
        width: '100%'
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
        opacity: 0.75,
        alignItems: 'center',
        backgroundColor: 'black',
        justifyContent: 'center',
        height: '100%',
        zIndex:1
      },
})

/*
  Bind state and dispatch actions to props
*/
const mapStateToProps = (state) => ({
    loading: state.alertsData.loading,
    addDocToFavData: state.alertsData.addToFavouriteData,
    errorMessage: state.alertsData.errorMessage,
    isConnected: state.offlineReducer.isConnected,
});

const mapDispatchToProps = dispatch => {
    return {
        addDocToFavourites: (token, params) => { dispatch(addDocToFavourites(token, params)); },
        getAlerts: (token, userID, pullToRefreshFlag) => { dispatch(fetchAlerts(token, userID, pullToRefreshFlag)); },
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(AlertDetailScreen)