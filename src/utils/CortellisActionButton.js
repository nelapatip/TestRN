
import React from "react";
import {COLOR} from "../constants/Colors";
import { StyleSheet, View, TouchableOpacity, Image, Alert, Text } from "react-native";
import { Normalize, NormalizeLayout } from './Scale'
import fonts from './CortellisFonts'

class CortellisButton extends React.Component {
  static defaultProps = {
    buttonColor: COLOR.THEME_COLOR ,
    textColor: COLOR.WHITE,
    width: Normalize(295),
    height: Normalize(48),
    borderRadius: Normalize(24)
  };

  render() {
    // color theming (with defaults)
    const buttonColorStyles = { backgroundColor: this.props.buttonColor };
    const textColorStyles = { color: this.props.textColor };
    const BUTTON_SIZE_HEIGHT = {height: Normalize(this.props.height)}
    const BUTTON_SIZE_WIDTH = {width: Normalize(this.props.width)}
    const Button_radius = {borderRadius: Normalize(this.props.height/2)}
      return (
        <TouchableOpacity
          onPress={this.onPress}
          activeOpacity={0.8}
          style={[styles.button, buttonColorStyles, BUTTON_SIZE_HEIGHT, BUTTON_SIZE_WIDTH, Button_radius]}
        >
        <Text style={[styles.text, textColorStyles]}>{this.props.buttonText}</Text>
        </TouchableOpacity>
      );
   
  }

  onPress = _ => {
    this.props.onPress && this.props.onPress();
  };

}

/* StyleSheet =============================================================== */

const styles = StyleSheet.create({
  button: {
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center"
  },
  text: {
    fontFamily: fonts.SourceSansProBold,
    fontSize: Normalize(16),
    fontWeight: '600',
    textAlign: 'center'
  }
});

export default CortellisButton



// const playButton = PlayButton;
// playButton.__cards__ = define => {
//   define("Large Yellow/Pink (Default)", _ => <PlayButton />);
//   define("Small Yellow/Pink", _ => <PlayButton type="small" />);

//   define("Large Blue/Green", _ => (
//     <PlayButton
//       buttonColor={F8Colors.blue}
//       iconColor={F8Colors.green}
//       onPress={() => Alert.alert("<PlayButton /> pressed!")}
//     />
//   ));

//   define("Small Pink/Yellow", _ => (
//     <PlayButton
//       type="small"
//       buttonColor={F8Colors.pink}
//       iconColor={F8Colors.yellow}
//       onPress={() => Alert.alert("<PlayButton /> pressed!")}
//     />
//   ));
// };
