import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Platform,
    Alert
} from 'react-native';
import fonts from '../utils/CortellisFonts'
import { Normalize, NormalizeLayout } from '../utils/Scale'
import RoundedBlueButton from '../utils/CustomButtons/RoundedBlueButton'

import OfflineNotice from '../utils/OfflineNotice'
import NetInfo from "@react-native-community/netinfo";
import { COLOR } from '../constants/Colors';
import { CONSTANTS } from '../constants/Constants';
import { AlertSwiper } from '../utils/AlertSwiper';
import firebase from 'react-native-firebase'
import bgImg2 from '../assets/welcomeImages/welcome_image_2.png'
import bgImg1 from '../assets/welcomeImages/welcome_image_1.png'
import mainImg from '../assets/welcomeImages/main_welcome_image_1.png'

let Analytics = firebase.analytics();

class WelcomeScreen extends Component {
    static navigationOptions = {
        headerShown: false
    };

     

    componentDidMount() {
        Analytics.logEvent(CONSTANTS.FIREBASE_ANALYTICS.WELCOME_SCREEN,{"platform":Platform.OS})
        NetInfo.isConnected.addEventListener('connectionChange', this._handleConnectionChange);
    }

    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', this._handleConnectionChange);
    }

    _handleConnectionChange = (isConnected) => {
        //this.props.connectionState({ status: isConnected });
    };


    onLogin = () => {
        Analytics.logEvent(CONSTANTS.FIREBASE_ANALYTICS.EXIST_CORTELLIS_ACCOUNT,{"platform":Platform.OS})
         this.props.navigation.navigate("SignIn")
    }

    render() {
        // firebase.analytics().setCurrentScreen('HOME');


        return (
            <View style={styles.container}>
                <AlertSwiper autoPlayTime={3} firstImg={mainImg} secondImg={bgImg1} thirdImg={bgImg2}></AlertSwiper>
                <View style={styles.input}>
                    <RoundedBlueButton text={CONSTANTS.WelcomeScreen.Cortellis_account} blueButtonStyle={styles.roundedButtonStyle} textStyle={[styles.text, { width: '80%', alignSelf: 'center' }]} onPress={() => this.onLogin()}></RoundedBlueButton>
                    <RoundedBlueButton text={CONSTANTS.WelcomeScreen.No_account} blueButtonStyle={[styles.roundedButtonStyle, { backgroundColor: COLOR.WHITE }]} textStyle={[styles.text, { color: COLOR.BUTTON_TEXT_COLOR, width: '80%', alignSelf: 'center' }]} onPress={() => this.props.navigation.navigate({ routeName: "RequestDemo" })} />
                </View>
                {/* <OfflineNotice/> */}
            </View>

        );
    }
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
    },


    text: {
        color: '#fff',
        fontSize: Normalize(16),
        textAlign: 'center',
        fontFamily: fonts.SourceSansProRegular,

    },
    title: {
        fontSize: Normalize(26),
        height: NormalizeLayout(33),
        fontWeight: 'bold',
        marginLeft: NormalizeLayout(16),
        marginRight: NormalizeLayout(16),
        color: '#fff',
        textAlign: 'center',
        fontFamily: fonts.SourceSansProBold,


    },
    roundedButtonStyle: {
        marginTop: NormalizeLayout(16),
        paddingBottom: NormalizeLayout(16),
        paddingTop: NormalizeLayout(12.5),
        backgroundColor: COLOR.THEME_COLOR,
        borderRadius: NormalizeLayout(24),
        borderWidth: NormalizeLayout(1),
        borderColor: COLOR.THEME_COLOR,
        height: NormalizeLayout(48)
    },
    input: {
        flex: 1,
        position: 'absolute',
        width: '80%',
        bottom: NormalizeLayout(70),
        justifyContent: 'space-between',
        alignSelf: 'center',
        flexDirection: 'column',
    },
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '43%',
        borderRadius: NormalizeLayout(24),
        backgroundColor: '#00A7E0'
    }
})


export default WelcomeScreen;