import React from 'react';
import {  StyleSheet, Text, View, BackHandler } from 'react-native';
import { Normalize, NormalizeLayout } from '../../utils/Scale'
import { CONSTANTS } from '../../constants/Constants'
import { COLOR } from '../../constants/Colors'
import fonts from '../../utils/CortellisFonts'

export default class LearnMore extends React.Component {
    static navigationOptions = {
        title: 'Interests',
        headerTitleStyle: {
            color: COLOR.THEME_COLOR,
        },
        headerTintColor: COLOR.THEME_COLOR,
    };

    constructor(props) {
        super(props);
        this.state = {}
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    }

    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    handleBackButtonClick() {  
        this.props.navigation.goBack(null);
        return true;
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <View><Text style={Styles.Header}>Interests</Text></View>
                <View style={{ padding: 10, marginTop: NormalizeLayout(21) }}>
                    <Text style={[Styles.bottomText]}>{CONSTANTS.LearnMoreScreen.text}</Text>
                </View>

            </View>
        );
    }
}
const Styles = StyleSheet.create({

    Header: {
        color: COLOR.HEADER_BG,
        fontFamily: fonts.SourceSansProBold,
        fontWeight: '500',
        fontSize: Normalize(28),
        textAlign: 'center',
        marginTop: NormalizeLayout(40)
    },
    bottomText: {
        color: COLOR.GRAY_TEXT,
        fontFamily: fonts.SourceSansProRegular,
        fontSize: Normalize(16),
        fontWeight: 'normal',
        textAlign: 'justify',
    },
}) 