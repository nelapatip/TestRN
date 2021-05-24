import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { COLOR } from '../../constants/Colors'
import SvgArrow from '../../../assets/svgimage/Arrow'
import fonts from '../../utils/CortellisFonts'

import { Normalize, NormalizeLayout } from '../../utils/Scale'

export default class MoreListRow extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <TouchableOpacity
        disabled={this.props.mode == 'edit' ? true : false}
        onPress={() => this.props.onMorePress()}>
        <View style={styles.mainview}>
          <Text style={styles.header}>{this.props.title}</Text>
          <Text style={styles.optionview}>{this.props.option}</Text>
          <SvgArrow />
        </View>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  header: {
    color: COLOR.PRIMARY_TEXT_COLOR,
    lineHeight: NormalizeLayout(20),
    fontSize: Normalize(16),
    alignContent: 'center',
    width: '75%',
    fontFamily: fonts.SourceSansProRegular
  },
  optionview: {
    color: COLOR.THEME_COLOR,
    margin: NormalizeLayout(20),
    height: NormalizeLayout(15),
    fontSize: Normalize(12),
    alignContent: 'center',
    fontFamily: fonts.SourceSansProRegular
  },
  sepview: {
    backgroundColor: COLOR.Gray_Sep,
    marginTop: NormalizeLayout(29),
    height: Normalize(2),
    width: '100%'
  },
  mainview: {
    backgroundColor: COLOR.WHITE,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: NormalizeLayout(18),
    height: NormalizeLayout(56),
    justifyContent: 'space-between',
    marginRight: NormalizeLayout(20)
  },
  titleview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
