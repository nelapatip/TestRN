import React from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { Switch } from 'native-base';
import { COLOR } from '../../constants/Colors'
import { Normalize, NormalizeLayout } from '../../utils/Scale'
import fonts from '../../utils/CortellisFonts'

export default class SwitchListRow extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      value: this.props.value
    }
  }

  componentWillReceiveProps(newProps) {
    this.setState({ value: newProps.value })
  }

  render() {
    return (
      <View style={styles.rowStyle}>
        <Text numberOfLines={2} style={styles.headingview} ellipsizeMode="tail">{this.props.text}</Text>
        <View style={styles.switchview}>

          <Switch
            disabled={this.props.mode == 'edit' ? true : false}
            thumbColor={(this.state.value && Platform.OS == 'android') ? this.props.mode == 'edit' ? '' : 'white' : ''}
            // thumbColor={(this.state.value && Platform.OS == 'android') ? COLOR.THEME_COLOR : ''}
            trackColor={{true: COLOR.THEME_COLOR, false: COLOR.Gray_Sep}}
            value={ this.props.mode == 'edit' ? false : this.state.value}
           // value={this.state.value}
            onValueChange={(value) => { 
              this.props.onToggleRemember(value)
              this.setState({ value : value})
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
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    height: NormalizeLayout(56),
    marginRight: NormalizeLayout(16),
    marginLeft: NormalizeLayout(16),
  },
  headingview: {
    color: COLOR.PRIMARY_TEXT_COLOR,
    marginTop: NormalizeLayout(17),
    marginRight: NormalizeLayout(17),
    fontSize: Normalize(16),
    justifyContent: 'center',
    lineHeight: Normalize(20),
    width: '80%',
    height: '72%',
    fontFamily: fonts.SourceSansProRegular
  },
  switchview: {
    marginTop: NormalizeLayout(15),
    justifyContent: 'center',
    height: Normalize(20),
  },

});
