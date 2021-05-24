import React from 'react';
import { ScrollView, StyleSheet, Text, View, Image } from 'react-native';
import { CheckBox, StyleProvider } from 'native-base'
import { COLOR } from '../../constants/Colors'
import SvgCheckedImg from '../../../assets/svgimage/CheckedImg'

import { Normalize, NormalizeLayout } from '../../utils/Scale'
import fonts from '../../utils/CortellisFonts'
import getTheme from '../../../native-base-theme/components';
import material from '../../../native-base-theme/variables/material';



export default class CheckBoxListRow extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isChecked: this.props.isChecked      
    }
  }

  componentWillReceiveProps(newProps) {
    this.setState({ isChecked: newProps.isChecked })
  }

  render() {
    return (
      <View style={styles.rowStyle}>
        <Text style={styles.headingview}>{this.props.text}</Text>
        <View style={[styles.checkbox]}>
            <CheckBox
              style={styles.checkBoxStyle}
              disabled={!this.props.isDualUser || this.props.readOnly}
              checked={this.props.isDualUser ? (this.props.readOnly ? false : this.state.isChecked) : (this.props.readOnly ? false : this.state.isChecked)}
              onPress={() => {
                if (!this.props.readOnly) {
                  this.setState({ isChecked: !this.state.isChecked }, () => {
                    this.props.onChecked(this.state.isChecked)
                  })
                }
              }}
            />
        </View>

      </View>



    )

  }
}

const styles = StyleSheet.create({

  rowStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: NormalizeLayout(56),
    marginRight: NormalizeLayout(16),
    marginLeft: NormalizeLayout(16),

  },
  checkBoxStyle: {
    width: 22,
    height: 22,
    alignItems: 'center'
  },
  headingview: {
    color: COLOR.BLACK_TEXT,
    marginTop: NormalizeLayout(17),
    fontSize: Normalize(16),
    justifyContent: 'center',
    width: '80%',
    height: NormalizeLayout(25),
    fontFamily: fonts.SourceSansProRegular
  },
  checkbox: {
    marginTop: NormalizeLayout(15),
    height: NormalizeLayout(20),
    justifyContent: 'center',
    paddingRight: NormalizeLayout(10)
  },

});
