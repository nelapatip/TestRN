import React from 'react';
import { ScrollView, StyleSheet, Text, View, Image } from 'react-native';
import { CheckBox } from 'native-base'
import { COLOR } from '../../constants/Colors'
import SvgCheckedImg from '../../../assets/svgimage/CheckedImg'

import { Normalize, NormalizeLayout } from '../../utils/Scale'
import fonts from '../../utils/CortellisFonts'

export default class HeaderListRow extends React.Component {

  constructor(props) {
    super(props);

  }

  componentDidMount() {
  }


  render() {

    return (


      <View style={styles.mainview}>
        <View style={styles.titleview}>
          <Text style={styles.header}>{this.props.title}</Text>
        </View>

        <View style={styles.sepview}></View>
      </View>



    )

  }
}

const styles = StyleSheet.create({


  header: {
    color: COLOR.LIGHT_GRAY_TEXT,
    marginLeft: NormalizeLayout(16),
    fontSize: Normalize(12),
    lineHeight: Normalize(15),
    justifyContent:'center',
    fontWeight: 'bold',
    fontFamily:fonts.SourceSansProBold

  },
  
  sepview: {
    backgroundColor: COLOR.Gray_Sep,
    height: Normalize(2),
    width: '100%'
  },
  mainview: {
    backgroundColor: COLOR.TAB_BG_COLOR,
    flexDirection: 'column',
    justifyContent: 'center',
    height: NormalizeLayout(60)

  },

  titleview:{
      justifyContent: 'center',
      height:'100%'
  }

});
