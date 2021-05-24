import React from 'react';
import { ScrollView, StyleSheet, Text, View, FlatList, Image, Dimensions, TouchableOpacity, SafeAreaView, Animated } from 'react-native';
import { Normalize, NormalizeLayout } from '../utils/Scale'
import { COLOR } from '../constants/Colors'

import fonts from './CortellisFonts'

export default class TopHeader extends React.Component {
  constructor(props) {
    super(props);

  }
  render() {
    return (
      <View style={{ flexDirection: 'column' }}>
        <View style={styles.headerview}>

          <Text style={styles.leftTextView}>{this.props.count} {this.props.leftText}</Text>
          <View style={[styles.endview,{}]}>
            {!this.props.isEditModeOn && (
              <View style={[styles.endview,{}]}>
                <TouchableOpacity onPress={this.props.button1OnPress}>
                  <Text style={styles.rightTextView}>{this.props.button1Text}</Text>
                </TouchableOpacity>
                <View style={[styles.divider]} />
              </View>
            )}

            <TouchableOpacity onPress={this.props.button2OnPress}>
              <Text style={[styles.rightTextView, { color: this.props.isEditModeOn ? COLOR.THEME_COLOR : COLOR.DARK_GRAY_TEXT }]}>{this.props.button2Text}</Text>
            </TouchableOpacity>

          </View>
        </View>
        <View style={styles.sepview}>
        </View>
      </View>
    );
  }

}


const styles = StyleSheet.create({

  headerview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLOR.BLACK_HEADER_TEXT,
    alignItems: 'center',
    height: NormalizeLayout(60)
  },
  endview: {
    flexDirection: 'row',
    backgroundColor: COLOR.BLACK_HEADER_TEXT,
    alignItems: 'center',
    height:'99%'
  },
  leftTextView: {
    marginTop: NormalizeLayout(20),
    marginBottom: NormalizeLayout(20),
    marginLeft: NormalizeLayout(20),
    fontSize: Normalize(16),
    color: COLOR.DARK_GRAY_TEXT,
    fontFamily: fonts.SourceSansProBold,
  },
  rightTextView: {
    marginTop: NormalizeLayout(20),
    marginBottom: NormalizeLayout(20),
    marginRight: NormalizeLayout(15),
    fontSize: Normalize(16),
    color: COLOR.DARK_GRAY_TEXT,
    fontFamily: fonts.SourceSansProRegular,

  },
  sepview: {
    width: '100%',
    backgroundColor: COLOR.Gray_Sep,
    height: NormalizeLayout(2)
  },
  divider: {
    height: NormalizeLayout(24),
    backgroundColor: '#7A8183',
    width: NormalizeLayout(1),
    marginRight: NormalizeLayout(15)

  },

});

