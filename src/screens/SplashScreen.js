import React, { Component } from 'react';
import {
  View,
  Platform,
  Text,
  Alert,
  StyleSheet, Image
} from 'react-native';
import { Normalize } from '../utils/Scale'
import SvgCortellisLogoRgbColor2 from '../../assets/svgimage/CortellisLogoRgbColor2'
import bgImg from '../assets/welcomeImages/Group.png'
import bgDarkImg from '../assets/welcomeImages/RGBImg.png'

const timerTime = Platform.OS == 'android' ? 1000 : 0

class SplashScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isForAndroid: Platform.OS == 'android' ? true : false
    };

  }

  performTimeConsumingTask = async () => {
    return new Promise((resolve) =>
      setTimeout(
        () => { resolve('result') },
        timerTime
      )
    )
  }
  async componentDidMount() {
    // Preload data from an external API
    // Preload data using AsyncStorage
    const data = await this.performTimeConsumingTask();

    if (data !== null) {
      this.props.navigation.navigate('App');
    }
  }


  render() {
    if (this.state.isForAndroid) {
      return (

        <View style={{
          width: this.state.isForAndroid ? '100%' : '0%',
          height: this.state.isForAndroid ? '100%' : '0%',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <Image
            style={{
              position: 'absolute',
              height: "100%",
              width: "100%",
              opacity: 0.2

            }}

            source={bgImg}
          />
          <Image
            style={{
              position: 'absolute',
              height: "100%",
              width: "100%",
              opacity: 0.2

            }}

            source={bgDarkImg}
          />
          <SvgCortellisLogoRgbColor2 />
        </View>
      )
    }
    return null
  }
}
const styles = StyleSheet.create({

  parentView: {
    backgroundColor: 'white',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  mainText: {
    fontSize: Normalize(36),
    fontFamily: 'SourceSansPro-SemiBold'
  }
})


export default SplashScreen;

