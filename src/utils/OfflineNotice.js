import React, { PureComponent } from 'react';
import { View, Text, Dimensions, StyleSheet, Platform, Animated, SafeAreaView } from 'react-native';
import { COLOR } from '../constants/Colors'

const { width } = Dimensions.get('window');
const OFFSET_HEIGHT = Platform.OS !== "ios" ? 68 : 68;
import { CONSTANTS } from '../constants/Constants'
import firebase from 'react-native-firebase'

let Analytics = firebase.analytics();

class OfflineNotice extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            status: this.props.ConnectionStatus,
            presentAnimation: new Animated.Value(-0.2),
            isHidding: false,

        };
    }

    componentDidMount() {
        setTimeout(() => {
            this.startAnimation();
        }, 5000);
    }

    startAnimation = () => {
        Animated.timing(this.state.presentAnimation, {
            toValue: 1,
            duration: 500,
            delay: 0,
            useNativeDriver: true
        }).start(() => {
            setTimeout(() => {
                this.startAnimation2();
            }, 3000);
        })
    }

    startAnimation2 = () => {
        Animated.timing(this.state.presentAnimation, {
            toValue: -0.2,
            duration: 500,
            delay: 0,
            useNativeDriver: true
        }).start()
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.ConnectionStatus != this.props.ConnectionStatus) {
            this.setState({ status: nextProps.ConnectionStatus })
            if (this.state.status)
                Analytics.logEvent(CONSTANTS.FIREBASE_ANALYTICS.NET_DISCONNECTED, { "platform": Platform.OS, "userId": global.userID })
            else
                Analytics.logEvent(CONSTANTS.FIREBASE_ANALYTICS.NET_CONNECTED, { "platform": Platform.OS, "userId": global.userID })

                setTimeout(() => {
                    this.startAnimation();
                }, 5000);
        }
    }

    render() {
        let TranslateY = this.state.presentAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [-100, 0]
        })
        if (!this.state.status) {
            return (
                <Animated.View style={{ position: 'absolute', width: '100%', zIndex: 2, transform: [{ translateY: TranslateY }] }}>
                    <SafeAreaView style={[styles.SafeAreaViewTop]} >
                        <View style={styles.offlineContainer}>
                            <Text style={styles.offlineText}>{CONSTANTS.NO_INTERNET}</Text>
                        </View>
                    </SafeAreaView>
                </Animated.View >
            );
        }
        return null;
    }
}

const styles = StyleSheet.create({
    offlineContainer: {
        backgroundColor: COLOR.PINK,
        height: OFFSET_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        width,
    },

    offlineText: { color: '#fff' },

    SafeAreaViewTop: {
        backgroundColor: COLOR.PINK
    },
})

export default OfflineNotice;