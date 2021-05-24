import React from 'react';
import { StyleSheet, View, Animated, Dimensions, SafeAreaView, Platform, Share, BackHandler } from 'react-native';
import { connect } from "react-redux";
import Pdf from 'react-native-pdf'
import RNFS from 'react-native-fs'
import OfflineNotice from '../../utils/OfflineNotice'


import { COLOR } from '../../constants/Colors'
import NavigationHeader from '../../utils/NavigationHeader'
import { CONSTANTS } from '../../constants/Constants'
// import { getUserDetails } from '../../actions/LoginActions'

class DocumentViewScreen extends React.Component {
  static navigationOptions = {
    title: 'Document',
    headerShown: false
  };

  constructor(props) {
    super(props);
    this.state = {
      PDFDataTest: '',
      pdfLocalFilePath: '',
      isValidDocument: undefined
    };

    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);

  }

  backPress = () => {
    this.props.navigation.goBack()
  }
  componentDidMount() {
    const { navigation } = this.props;
    if (navigation.getParam('DocumentData')) {
      this.setState({ isValidDocument: true }, () => {
        this.state.PDFDataTest = navigation.getParam('DocumentData');

        RNFS.readFile(this.state.PDFDataTest).then(file => {
          this.setState({ pdfLocalFilePath: file })
        })
      })
    }
    else {
      this.setState({ isValidDocument: false })
    }
  }

  componentWillMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
  }

  handleBackButtonClick() {
    this.props.navigation.goBack();
    return true;
  }

  // saveFile() {
  //   if (Platform.OS === 'ios') {
  //     Share.share({
  //       url: 'data:application/pdf;base64,' + this.state.PDFDataTest
  //     }).then(result => {
  //       if (result.action === Share.sharedAction) {
  //         if (result.activityType) {
  //           // shared with activity type of result.activityType
  //         } else {
  //           // shared
  //         }
  //       } else if (result.action === Share.dismissedAction) {
  //         // dismissed
  //       }
  //     }).catch(error => {
  //       console.log('Error: ' + error)
  //     })
  //   }
  //   else {

  //   }
  // }

  render() {

    // const { navigation } = this.props;
    // this.state.PDFDataTest = navigation.getParam('DocumentData');

    // var file  = RNFS.readFile(this.state.PDFDataTest,"base64")

    return (
      <View style={styles.mainview}>
        <SafeAreaView style={styles.SafeAreaViewTop}>
          <NavigationHeader title={CONSTANTS.DOCUMENT_VIEW} backAction={this.backPress} back={true}></NavigationHeader>
        </SafeAreaView>

        <View style={{ flex: 1 }}>
          <View style={{ flexGrow: 1, backgroundColor: 'black' }}>
            {this.state.isValidDocument && (
              <Pdf
                source={{ uri: this.state.pdfLocalFilePath }}
                onLoadComplete={(numberOfPages, filePath) => {
                  console.log(`number of pages: ${numberOfPages}`)
                  this.setState({ pdfLocalFilePath: filePath })
                }}
                onPageChanged={(page, numberOfPages) => {
                  console.log(`current page: ${page}`)
                }}
                onError={(error) => {
                  console.log(error)
                }}
                style={styles.pdf} />
            )}

          </View>

        </View>

        <OfflineNotice ConnectionStatus={this.props.isConnected} />

      </View>
    )
  }
}

const styles = StyleSheet.create({
  mainview: {
    flexDirection: 'column',
    flex: 1
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 25,
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'red'
  },
  SafeAreaViewTop: {
    backgroundColor: COLOR.HEADER_BG,
  },
});

/*
Bind state and dispatch actions to props
*/
const mapStateToProps = state => ({
  // User: state.loginData.userObject,
  isConnected: state.offlineReducer.isConnected,

});


const mapDispatchToProps = dispatch => ({
  // getUserDetails: () => dispatch(getUserDetails())
});


export default connect(mapStateToProps, mapDispatchToProps)(DocumentViewScreen);