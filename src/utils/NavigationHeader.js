import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import { COLOR } from '../constants/Colors'
import SvgBackArrow from '../../assets/svgimage/BackArrow'
import { Normalize, NormalizeLayout } from '../utils/Scale'
import fonts from '../utils/CortellisFonts'

export default class NavigationHeader extends React.Component {
  constructor(props) {
    super(props);

  }

  render() {

    return (

      <View style={styles.mainview}>


        <View style={{width: NormalizeLayout(60), height: NormalizeLayout(60), justifyContent: 'center', flex: 1, paddingLeft: NormalizeLayout(16), }}>
          {this.props.back && (<TouchableOpacity style={{ flex: 1,justifyContent:'center'}} onPress={this.props.backAction}>
            <SvgBackArrow />
          </TouchableOpacity>)}
        </View>

        <View style={{ flex: 2, alignItems: 'center' }}>
          <Text style={styles.header}>{this.props.title}</Text>
        </View>
        <View style={{flex: 1, alignItems: 'flex-end', paddingRight: NormalizeLayout(16)}}>
          {this.props.showActionButton && (
            <TouchableOpacity style={{ flex: 1, justifyContent: 'center'}} onPress={this.props.actionPress}>
              <Text style={styles.action}>{this.props.action}</Text>
            </TouchableOpacity>)
          }
        </View>
      </View>
    )

  }
}

const styles = StyleSheet.create({
  header: {
    color: COLOR.WHITE,
    fontSize: Normalize(18),
    lineHeight: NormalizeLayout(23),
    fontWeight: 'bold',
    fontFamily: fonts.SourceSansProBold,

  },
  action: {
    color: COLOR.WHITE,
    fontSize: Normalize(18),
    height: Normalize(23),
    justifyContent: 'center',
    fontFamily: fonts.SourceSansProRegular,

  },
  sepview: {
    backgroundColor: COLOR.Gray_Sep,
    height: Normalize(2),
    width: '100%'
  },
  mainview: {
    backgroundColor: COLOR.HEADER_BG,
    flexDirection: 'row',
    height: NormalizeLayout(68),
    alignItems: 'center'
  },

  titleview: {
    justifyContent: 'center',
    height: '100%'
  }

});
