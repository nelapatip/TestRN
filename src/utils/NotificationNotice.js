import React, { PureComponent } from 'react';
import { View, Text, Dimensions, StyleSheet, Platform, Animated, SafeAreaView } from 'react-native';
import { COLOR } from '../constants/Colors'

const { width } = Dimensions.get('window');
const OFFSET_HEIGHT = Platform.OS !== "ios" ? 68 : 68;

class NotificationNotice extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            status: this.props.status,
            displayText: this.props.displayText,
            presentAnimation: new Animated.Value(0),
            isHidding: false,

        };
    }

    componentDidMount() {
        this.startAnimation()
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
            toValue: -0.20,
            duration: 500,
            delay: 0,
            useNativeDriver: true
        }).start()
    }

    shouldComponentUpdate() {
        this.startAnimation()
        return true
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.Status != this.props.Status) {
            this.setState({ status: nextProps.Status })
            this.startAnimation()
        }
    }

    render() {
        let TranslateY = this.state.presentAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [-100, 0]
        })
        if (this.state.status === "Success") {
            return (
                <Animated.View  accessible={false} style={{ position: 'absolute', width: '100%', zIndex: 2, transform: [{ translateY: TranslateY }] }}>
                    <SafeAreaView  accessible={false} style={[styles.SafeAreaViewTop]} >
                        <View style={[styles.offlineContainer, { backgroundColor: '#85F0AD' }]}>
                            <Text accessibilityLabel={this.state.displayText} style={[styles.offlineText, { color: 'black' }]}>{this.state.displayText}</Text>
                        </View>
                    </SafeAreaView>
                </Animated.View >
            );
        } else {
            return (
                <Animated.View  accessible={false} style={{ position: 'absolute', width: '100%', zIndex: 2, transform: [{ translateY: TranslateY }] }}>
                    <SafeAreaView  accessible={false} style={[styles.SafeAreaViewTopFail]} >
                        <View style={[styles.offlineContainer]}>
                            <Text accessibilityLabel={this.state.displayText} style={styles.offlineText}>{this.state.displayText}</Text>
                        </View>
                    </SafeAreaView>
                </Animated.View>
            );
        }
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
        backgroundColor: '#85F0AD'
    },
    SafeAreaViewTopFail: {
        backgroundColor: COLOR.PINK
    },
});

export default NotificationNotice;