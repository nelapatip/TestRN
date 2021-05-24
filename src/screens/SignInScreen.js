import React from 'react';
import { Alert, Button, TextInput, View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { NavigationActions } from "@react-navigation/compat";

import { getUserToken, saveUserToken, saveUserDetails } from "../actions/LoginActions";
import { connect } from "react-redux";
import { LoginPageURL } from '../configurations/configurations'
import { COLOR } from '../constants/Colors'
import { WebView } from 'react-native-webview';
import OfflineNotice from '../utils/OfflineNotice'

import { decode as atob, encode as btoa } from 'base-64'


class SignInScreen extends React.Component {

    static navigationOptions = {
        title: 'Sign In',
        headerBackTitle: "Back",
        headerTitleStyle: {
            color: COLOR.THEME_COLOR,
        },
        headerTintColor: COLOR.THEME_COLOR,
    };

    constructor(props) {
        super(props);
        this.state = {
            openWebView: true,
            authCode: '',
            loading: true
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
                // alert("authcode==" + authcode)
                console.log("authcode==" + authcode);
                this.setState({
                    authCode: authcode
                }, () => {
                    this.props.saveUserToken(this.state.authCode)
                    var userObj = this.parseJwt(this.state.authCode)
                    //console.log("check the response " + a['1p:eml'])
                    this.props.saveUserDetails(JSON.stringify(userObj))
                    this.props.navigation.navigate("Main")

                    //console.log(this.parseJwt(this.state.authCode))
                });

            }
        }
        return true
    }

    parseJwt = (token) => {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    };

    render() {
        let { email, password } = this.state;
        let { isLoginPending, isLoginSuccess, loginError } = this.props;

        const INJECTED_JAVASCRIPT = `(function() {
            const meta = document.createElement('meta');
                         meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
                         meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta);
          })();`;

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
                        }}>
                        <WebView
                            source={{ uri: LoginPageURL }}
                            javaScriptEnabled={true}
                            onShouldStartLoadWithRequest={this._onNavigationStateChange.bind(this)}
                            //onNavigationStateChange={this._onNavigationStateChange.bind(this)}
                            incognito={true}
                            cacheEnabled={false}
                            domStorageEnabled={false} //Disable cache
                            useWebKit={true}
                            injectedJavaScript={INJECTED_JAVASCRIPT}
                            onMessage={() => {}}
                            //onLoadStart={this.setState({loading: true})}
                            onLoadEnd={() => this.setState({ loading: false })}
                        />
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
        //backgroundColor:'red'
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
    token: state.loginData.token,
    isConnected: state.offlineReducer.isConnected,
});


const mapDispatchToProps = dispatch => ({
    getUserToken: () => dispatch(getUserToken()),
    saveUserToken: (authcode) => dispatch(saveUserToken(authcode)),
    saveUserDetails: (userObj) => dispatch(saveUserDetails(userObj))
});

export default connect(mapStateToProps, mapDispatchToProps)(SignInScreen);