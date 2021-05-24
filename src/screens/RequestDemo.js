import React from 'react';
import { Alert, Button, TextInput, View, StyleSheet, Text, ActivityIndicator, Platform } from 'react-native';
import { RequestDemoURL } from '../configurations/configurations'
import { COLOR } from '../constants/Colors'
import { WebView } from 'react-native-webview';
import { CONSTANTS } from '../constants/Constants';
import firebase from 'react-native-firebase'
import OfflineNotice from '../utils/OfflineNotice'
import { connect } from "react-redux";

class RequestDemo extends React.Component {

    // static navigationOptions = {
    //     title: 'Request a demo ',
    //     headerTitleStyle: {
    //         color: COLOR.THEME_COLOR,
    //     },
    //     headerTintColor: COLOR.THEME_COLOR,
    // };

    constructor(props) {
        super(props);
        this.state = {
            openWebView: true,
            authCode: '',
            loading: this.props.isConnected
        };

    }

    componentDidMount() {
    }

    // WebView Navigation State Change
    _onNavigationStateChange(webViewState) {
        let url = webViewState.url;

        if (url.startsWith("http://com.clarivate.cortellisrimobile")) {
            this.setState({
                openWebView: false
            });

            if (url.includes("error=")) {
                console.log("Sign in Cancelled.");
            } else if (url.includes("accessToken=")) {

                let authcode = url.split("accessToken=")[1];
                console.log("authcode==" + authcode);
                this.setState({
                    authCode: authcode
                }, () => {
                    this.props.saveUserToken(this.state.authCode)
                    var userObj = this.parseJwt(this.state.authCode)
                    this.props.saveUserDetails(userObj['1p:eml'])
                    this.props.navigation.navigate('PreferenceStack')
                });

            }
        }
        return true
    }


    render() {

        firebase.analytics().setCurrentScreen(CONSTANTS.FIREBASE_ANALYTICS.NON_EXIST_CORTELLIS_ACCOUNT);
        firebase.analytics().logEvent(CONSTANTS.FIREBASE_ANALYTICS.NON_EXIST_CORTELLIS_ACCOUNT, { "platform": Platform.OS })
        if (this.props.isLoginSuccess) {
            console.log(this.props.navigation);
            this.props.navigation.navigate({ routeName: "Main" })
        }
        return (
            <View style={styles.container}>
                {this.state.openWebView && (
                    <View
                        style={{
                            paddingTop: 0,
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            backgroundColor: "white"
                        }}
                    >
                        {this.props.isConnected && <WebView
                            source={{ uri: RequestDemoURL }}
                            javaScriptEnabled={true}
                            onShouldStartLoadWithRequest={this._onNavigationStateChange.bind(this)}
                            useWebKit={true}
                            onLoadEnd={() => this.setState({ loading: false })}
                        />
                        }


                        <OfflineNotice ConnectionStatus={this.props.isConnected} />

                    </View>
                )}
                {this.state.loading && (
                    <View style={styles.loading}>
                        <ActivityIndicator color="grey" size="large" />
                    </View>
                )}
            </View>
        );
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ecf0f1',
    },
    input: {
        width: 200,
        height: 44,
        padding: 10,
        borderWidth: 1,
        borderColor: 'black',
        marginBottom: 10,
    },
    loading: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        backgroundColor: '#fff',
        opacity: 0.5,
        justifyContent: 'center',
        height: '100%'
    },
});

const mapStateToProps = state => ({
    isConnected: state.offlineReducer.isConnected,
});


const mapDispatchToProps = dispatch => ({
    getUserToken: () => dispatch(getUserToken()),
    saveUserToken: (authcode) => dispatch(saveUserToken(authcode)),
    saveUserDetails: (userObj) => dispatch(saveUserDetails(userObj))
});

export default connect(mapStateToProps, mapDispatchToProps)(RequestDemo);
