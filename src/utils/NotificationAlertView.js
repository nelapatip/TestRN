import React from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { COLOR } from '../constants/Colors'

import { Normalize, NormalizeLayout } from '../utils/Scale'

export default class NotificationAlertView extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  render() {
    return (
      <SafeAreaView accessible={false} style={[styles.SafeAreaViewTop, {backgroundColor : this.props.BGColor ? this.props.BGColor : COLOR.PINK}]} >
        <View accessible={false} style={styles.mainview}>
          <View  style={this.props.titleviewstyle}>
            <Text accessibilityLabel={this.props.title} numberOfLines={3} style={[this.props.headerstyle, { textAlign: 'center' }]}>{this.props.title}</Text>
          </View>
        </View>
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({

  SafeAreaViewTop: {
    backgroundColor: COLOR.PINK
  },
  mainview: {
    justifyContent: 'center',
    height: NormalizeLayout(60),
    width: '100%'
  },
});
