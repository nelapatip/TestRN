import React from 'react';
import { ScrollView, StyleSheet, Text, View, Platform, Dimensions, TouchableWithoutFeedback, Animated } from 'react-native';
import { COLOR } from '../constants/Colors'
import SvgShare from '../../assets/svgimage/Share'
import SvgStar from '../../assets/svgimage/Star5'
import SvgRelated from '../../assets/svgimage/Related'
import fonts from './CortellisFonts'

import { Normalize, NormalizeLayout } from './Scale'
import { CONSTANTS } from '../constants/Constants';

// export const BOTTOM_TAB_BAR_HEIGHT = Platform.OS === 'ios' ? (DeviceInfo.getModel().includes('iPhone X') ? (TAB_BAR_HEIGHT + SAFEAREA_BOTTOM_LAYOUT_HEIGHT) : TAB_BAR_HEIGHT) : TAB_BAR_HEIGHT
const { width: SCREEN_WIDTH } = Dimensions.get('window')
export default class TabBar extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isTab1Selected: true,
      isTab2Selected: false
    }
  }

  componentDidMount() {
  }

  onPress = () => {
   
  }

  render() {

    return (
      <View>
        <View style={styles.sepView}>
        </View>
        <View style={styles.mainview}>

          <TouchableWithoutFeedback style={styles.tabview} onPress={() => {
            this.props.onTab1Press()
            this.setState({ isTab1Selected: true, isTab2Selected: false })
          }
          }>
            <View style={styles.tabview}>
              {this.props.tab1Image}
              <Text style={[styles.title, { color: this.state.isTab1Selected ? COLOR.BLACK : COLOR.TAB_HEADER_COLOR, fontWeight:this.state.isTab1Selected ? '500':'400' }]}>{this.props.tab1Text}</Text>
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback style={styles.tabview} onPress={() => {
            this.props.onTab2Press()
            this.setState({ isTab2Selected: true, isTab1Selected: false })
          }
          }>
            <View style={styles.tabview}>
              {this.props.tab2Image}
              <Text style={[styles.title, { color: this.state.isTab2Selected ? COLOR.BLACK : COLOR.TAB_HEADER_COLOR, fontWeight:this.state.isTab2Selected ? '500':'400' }]}>{this.props.tab2Text}</Text>

            </View>

          </TouchableWithoutFeedback>

        </View>
        <View style={[styles.tabSelectedView,{marginLeft: this.state.isTab1Selected ? 0 : SCREEN_WIDTH/2 }]}>
        </View>
      </View>
    )

  }
}

const styles = StyleSheet.create({


  mainview: {
    backgroundColor: COLOR.WHITE,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: NormalizeLayout(56),
    paddingLeft: NormalizeLayout(15),
    paddingRight: NormalizeLayout(15),


  },
  sepView: {
    backgroundColor: COLOR.Gray_Sep,
    height: NormalizeLayout(1)
  },

  title: {
    fontSize: Normalize(14),
    color: COLOR.TAB_HEADER_COLOR,
    textAlign: 'center',
    fontFamily: fonts.SourceSansProRegular,


  },
  tabview: {
    flexDirection: 'row',
    height: NormalizeLayout(23),
    alignItems: 'center',
    justifyContent: 'center',
    flex: 2
  },
  tabSelectedView: {
    backgroundColor: COLOR.THEME_COLOR,
    height: NormalizeLayout(2),
    width:'50%'
  }

});
