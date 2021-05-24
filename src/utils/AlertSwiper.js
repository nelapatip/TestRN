import fonts from './CortellisFonts'
import Swiper from 'react-native-swiper'
import { Normalize, NormalizeLayout } from './Scale'
import Logo from '../assets/welcomeImages/WelcomeScreenSVG'


import { COLOR } from '../constants/Colors';
import { CONSTANTS } from '../constants/Constants';

import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image
} from 'react-native';

export const AlertSwiper = (props) => {
    return (
        <Swiper
            activeDot={<View style={[{
                backgroundColor: COLOR.THEME_COLOR
            },styles.dotStyle]} />}
            dot={<View style={[ {backgroundColor: '#AEECFC'},styles.dotStyle]} />}
            showsButtons={false} autoplay={true} autoplayTimeout={props.autoPlayTime}>
            <View style={styles.slide1}>

                <Image
                    style={{
                        position: 'absolute',
                        height: "100%",
                        width: "100%",

                    }}
                    source={props.firstImg}
                />
                <View style={{ marginTop: NormalizeLayout(80) }}><Logo /></View>
                <View style={{ marginTop: NormalizeLayout(67) }}>
                    <Text style={[styles.title]}>{CONSTANTS.WelcomeScreen.title}</Text>
                    <View style={{ marginTop: NormalizeLayout(11),marginLeft:NormalizeLayout(30),marginRight:NormalizeLayout(30)}}>
                        <Text style={[styles.text, { fontSize: Normalize(22) }]}>{CONSTANTS.WelcomeScreen.swiper1_text}</Text>
                    </View>
                </View>

            </View>
            <View style={styles.slide2}>
                <Image
                    style={{
                        position: 'absolute',
                        height: "100%",
                        width: "100%",

                    }}
                    source={props.secondImg}
                />
                <View style={{ marginTop: NormalizeLayout(80) }}><Logo /></View>
                <View style={{ marginTop: NormalizeLayout(67) }}>
                    <Text style={styles.title}>{CONSTANTS.WelcomeScreen.title}</Text>
                    <View style={{ marginTop: NormalizeLayout(11) ,marginLeft:NormalizeLayout(51),marginRight:NormalizeLayout(52)}}>
                        <Text style={[styles.text, { fontSize: Normalize(22) }]}>{CONSTANTS.WelcomeScreen.swiper2_text}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.slide3}>
                <Image
                    style={{
                        position: 'absolute',
                        height: "100%",
                        width: "100%",

                    }}
                    source={props.thirdImg}
                />
                <View style={{ marginTop: NormalizeLayout(80) }}><Logo /></View>
                <View style={{ marginTop: NormalizeLayout(67) }}>
                    <Text style={styles.title}>{CONSTANTS.WelcomeScreen.title}</Text>
                    <View style={{ marginTop: NormalizeLayout(11) ,marginLeft:NormalizeLayout(55),marginRight:NormalizeLayout(56)}}>
                        <Text style={[styles.text, { fontSize: Normalize(22) }]}>{CONSTANTS.WelcomeScreen.swiper3_text}</Text>
                    </View>
                </View>
            </View>
        </Swiper>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    // wrapper: {
    //     marginBottom: NormalizeLayout(28),

    // },
    dotStyle: {
         width: NormalizeLayout(6),
        height: NormalizeLayout(6),
        borderRadius: NormalizeLayout(3),
        marginLeft: NormalizeLayout(5),
        marginRight: NormalizeLayout(5),
        marginTop: NormalizeLayout(3),
        marginBottom: NormalizeLayout(3),
    },
    // activeDotStyle:{
    //     backgroundColor:COLOR.THEME_COLOR,
    //         width: 6, 
    //         height:6,borderRadius: 3, 
    //         marginLeft: 5,
    //          marginRight: 5, 
    //          marginTop: 3,
    //           marginBottom: 3,}
    // },
    slide1: {
        flex: 1,
        alignItems: 'center',

    },
    slide2: {
        flex: 1,
        alignItems: 'center',

    },
    slide3: {
        flex: 1,
        alignItems: 'center',
    },
    text: {
        color: '#fff',
        fontSize: Normalize(16),
        textAlign: 'center',
        fontFamily: fonts.SourceSansProRegular,

    },
    title: {
        fontSize: Normalize(26),
        lineHeight: Normalize(33),
        fontWeight: 'bold',
        marginLeft: NormalizeLayout(16),
        marginRight: NormalizeLayout(16),
        color: '#fff',
        textAlign: 'center',
        fontFamily: fonts.SourceSansProBold,

    },
    roundedButtonStyle: {
        marginTop: NormalizeLayout(16),
        // marginBottom: NormalizeLayout(16),
        // marginLeft: NormalizeLayout(39),
        // marginRight: NormalizeLayout(39),
        paddingBottom: NormalizeLayout(16),
        paddingTop: NormalizeLayout(12.5),
        // paddingLeft: NormalizeLayout(),
        // paddingRight: NormalizeLayout(40),
        backgroundColor: COLOR.THEME_COLOR,
        borderRadius: NormalizeLayout(24),
        borderWidth: NormalizeLayout(1),
        borderColor: COLOR.THEME_COLOR
    },
    input: {
        flex: 1,
        position: 'absolute',
        width: '80%',
        bottom: NormalizeLayout(100),
        justifyContent: 'space-between',
        alignSelf: 'center',
        flexDirection: 'column'

    },
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '43%',
        borderRadius: 24,
        backgroundColor: '#00A7E0'
    }
})