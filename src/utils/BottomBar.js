import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { COLOR } from '../constants/Colors'
import { CONSTANTS } from '../constants/Constants'
import fonts from '../utils/CortellisFonts'

import { Normalize, NormalizeLayout } from './Scale'
// import { CONSTANTS } from '../constants/Constants';
// export const BOTTOM_TAB_BAR_HEIGHT = Platform.OS === 'ios' ? (DeviceInfo.getModel().includes('iPhone X') ? (TAB_BAR_HEIGHT + SAFEAREA_BOTTOM_LAYOUT_HEIGHT) : TAB_BAR_HEIGHT) : TAB_BAR_HEIGHT

export default class BottomBar extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isTab1Selected: false,
      isTab2Selected: false,
      isTab3Selected: false,
    }
  }
  componentDidMount() {
  }

  onPress = () => {
    this.setState({
    })
  }

  render() {

    return (
      <View style={this.props.styles ? this.props.styles : {}}>
        <View style={styles.sepView}>
        </View>
        <View style={styles.mainview}>

          {(this.props.showItems == 2 || this.props.showItems == 3) && (this.props.isNetConnected && this.props.isFavEnabled) ? <TouchableOpacity style={styles.tabview} onPress={async () => {

            await this.setState({ isTab1Selected: !this.state.isTab1Selected, isTab2Selected: false, isTab3Selected: false }, () => {
              this.props.onTab1Press(this.state.isTab1Selected)
            })
            if (this.props.tab1Text == CONSTANTS.FAVOURITE || this.props.tab1Text == CONSTANTS.REMOVE) {
              setTimeout(() => {
                this.setState({ isTab1Selected: !this.state.isTab1Selected })
              }, 3000);
            }
          }
          }>
            <View style={styles.tabview}>
              {this.state.isTab1Selected ? this.props.tab1SelectedImage : this.props.tab1Image}

              <Text style={[styles.title, { color: this.state.isTab1Selected ? (this.props.tab1SelectionColor ? this.props.tab1SelectionColor : COLOR.THEME_COLOR) : (this.props.tab1UnSelectionColor ? this.props.tab1UnSelectionColor : COLOR.GRAY_TEXT) }]}>{this.props.tab1Text}</Text>
            </View>
          </TouchableOpacity> : <View style={[styles.tabview]}>
              {this.state.isTab1Selected ? this.props.tab1SelectedImage : this.props.tab1Image}

              <Text style={[styles.title, { color: this.state.isTab1Selected ? (this.props.tab1SelectionColor ? this.props.tab1SelectionColor : COLOR.THEME_COLOR) : (this.props.tab1UnSelectionColor ? this.props.tab1UnSelectionColor : COLOR.GRAY_TEXT) }]}>{this.props.tab1Text}</Text>
            </View>
          }

          {(this.props.showItems == 2 || this.props.showItems == 3) && (this.props.tab2Text == CONSTANTS.SHARE) ? (this.props.isFavEnabled) ?
            <TouchableOpacity style={styles.tabview} onPress={async () => {
              await this.setState({ isTab1Selected: false, isTab2Selected: !this.state.isTab2Selected, isTab3Selected: false }, () => {
                this.props.onTab2Press(this.state.isTab2Selected)
              })
              if (this.props.tab2Text == CONSTANTS.FAVOURITE || this.props.tab2Text == CONSTANTS.REMOVE) {
                // this.setState({ isTab2Selected: !this.state.isTab2Selected })
                setTimeout(() => {
                  this.setState({ isTab2Selected: !this.state.isTab2Selected })
                }, 1000);
              }
            }
            }>
              <View style={styles.tabview}>
                {this.state.isTab2Selected ? this.props.tab2SelectedImage : this.props.tab2Image}
                <Text style={[styles.title, { color: this.state.isTab2Selected ? (this.props.tab2SelectionColor ? this.props.tab2SelectionColor : COLOR.THEME_COLOR) : (this.props.tab2UnSelectionColor ? this.props.tab2UnSelectionColor : COLOR.GRAY_TEXT) }]}>{this.props.tab2Text}</Text>

              </View>
            </TouchableOpacity> :
            <View style={styles.tabview}>
              {this.state.isTab2Selected ? this.props.tab2SelectedImage : this.props.tab2Image}
              <Text style={[styles.title, { color: this.state.isTab2Selected ? (this.props.tab2SelectionColor ? this.props.tab2SelectionColor : COLOR.THEME_COLOR) : (this.props.tab2UnSelectionColor ? this.props.tab2UnSelectionColor : COLOR.GRAY_TEXT) }]}>{this.props.tab2Text}</Text>

            </View> : (this.props.isNetConnected && this.props.isFavEnabled) ?
              <TouchableOpacity style={styles.tabview} onPress={async () => {
                await this.setState({ isTab1Selected: false, isTab2Selected: !this.state.isTab2Selected, isTab3Selected: false }, () => {
                  this.props.onTab2Press(this.state.isTab2Selected)
                })
                if (this.props.tab2Text == CONSTANTS.FAVOURITE || this.props.tab2Text == CONSTANTS.REMOVE) {
                  // this.setState({ isTab2Selected: !this.state.isTab2Selected })
                  setTimeout(() => {
                    this.setState({ isTab2Selected: !this.state.isTab2Selected })
                  }, 1000);
                }
              }
              }>
                <View style={styles.tabview}>
                  {this.state.isTab2Selected ? this.props.tab2SelectedImage : this.props.tab2Image}
                  <Text style={[styles.title, { color: this.state.isTab2Selected ? (this.props.tab2SelectionColor ? this.props.tab2SelectionColor : COLOR.THEME_COLOR) : (this.props.tab2UnSelectionColor ? this.props.tab2UnSelectionColor : COLOR.GRAY_TEXT) }]}>{this.props.tab2Text}</Text>

                </View>
              </TouchableOpacity> :
              <View style={styles.tabview}>
                {this.state.isTab2Selected ? this.props.tab2SelectedImage : this.props.tab2Image}
                <Text style={[styles.title, { color: this.state.isTab2Selected ? (this.props.tab2SelectionColor ? this.props.tab2SelectionColor : COLOR.THEME_COLOR) : (this.props.tab2UnSelectionColor ? this.props.tab2UnSelectionColor : COLOR.GRAY_TEXT) }]}>{this.props.tab2Text}</Text>

              </View>
          }

          {(this.props.showItems == 3) ?
            <TouchableOpacity style={styles.tabview} onPress={() => {
              this.props.onTab3Press()
            }
            }>
              <View style={styles.tabview}>
                {this.state.isTab3Selected ? this.props.tab3SelectedImage : this.props.tab3Image}
                <Text style={[styles.title, { color: this.state.isTab3Selected ? (this.props.tab3SelectionColor ? this.props.tab3SelectionColor : COLOR.THEME_COLOR) : (this.props.tab3UnSelectionColor ? this.props.tab3UnSelectionColor : COLOR.GRAY_TEXT) }]}>{this.props.tab3Text}</Text>

              </View>
            </TouchableOpacity> : null
          }

          {(this.props.showItems == 1) ? (this.props.isNetConnected && this.props.isFavEnabled) ?
            <TouchableOpacity style={styles.tabview}>
              <View style={styles.tabview}>
                {this.state.isTab3Selected ? this.props.tab3SelectedImage : this.props.tab3Image}
                <Text style={[styles.title, { color: this.state.isTab3Selected ? (this.props.tab3SelectionColor ? this.props.tab3SelectionColor : COLOR.THEME_COLOR) : (this.props.tab3UnSelectionColor ? this.props.tab3UnSelectionColor : COLOR.GRAY_TEXT) }]}>{this.props.tab3Text}</Text>

              </View>

            </TouchableOpacity> : <View style={styles.tabview}>
              {this.state.isTab3Selected ? this.props.tab3SelectedImage : this.props.tab3Image}
              <Text style={[styles.title, { color: this.state.isTab3Selected ? (this.props.tab3SelectionColor ? this.props.tab3SelectionColor : COLOR.THEME_COLOR) : (this.props.tab3UnSelectionColor ? this.props.tab3UnSelectionColor : COLOR.GRAY_TEXT) }]}>{this.props.tab3Text}</Text>

            </View> : null
          }
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

    fontSize: Normalize(18),
    color: COLOR.GRAY_TEXT,
    textAlign: 'center',
    marginLeft: NormalizeLayout(5),
    fontFamily: fonts.SourceSansProRegular,
  },
  tabview: {
    flexDirection: 'row',
    height: NormalizeLayout(23),
    alignItems: 'center',
    justifyContent: 'center',
    flex: 2
  }
});
