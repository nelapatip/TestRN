import React from 'react';
import { View, TextInput, } from 'react-native';
import { Normalize, NormalizeLayout } from '../../utils/Scale'
import { CONSTANTS } from '../../constants/Constants'

var inputLength=70

export default class InputSelection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      setText: '',
      placeholderText: ''
    };
  }

  componentDidMount() {
    if (this.props.placeholder != undefined) {
      this.setState({ setText: this.props.placeholder })
    } else if (this.props.text) {
      this.setState({ setText: this.props.text })
    } else {
      this.setState({ setText: '' })
    }
  }


  componentWillReceiveProps(newProps) {
    if (this.props.placeholder == newProps.placeholder) {
      if (this.state.setText == '') {
        if (newProps.placeholder) {
          this.setState({ setText: newProps.placeholder })
        }
      }
    } else {
      if (this.props.placeholder == '' && newProps.placeholder != '') {
        this.setState({ placeholderText: newProps.placeholder }, () => {
          this.setState({ setText: this.state.placeholderText })
        })
      }
      else if (this.props.placeholder != '' && newProps.placeholder != '') {

      }
      else {
        // if (newProps.placeholder) {
        this.setState({ placeholderText: newProps.placeholder }, () => {
          if (newProps.text == '' && this.state.setText!=undefined && this.state.setText.length== (inputLength-1)) {
            this.setState({ setText: this.state.setText })

          }
          else{
          this.setState({ setText: this.state.placeholderText })
        }
      })
        // }
      }
    }

    if (newProps.text != '') {
      if (this.state.setText != '' && this.state.setText != newProps.text) {
        this.setState({ setText: '' })
      }
      if (this.props.text != newProps.text) {
        if (newProps.text)
          this.setState({ setText: newProps.text })
      }
      else {
      }
    } else {
      if (this.props.text != newProps.text) {
        if (this.state.setText != '') {
          if (newProps.text == '' && this.state.setText!=undefined && this.state.setText.length==(inputLength-1)) {
            alert(CONSTANTS.SelectRegion.text_length_limit) 
          }
          else
            this.setState({ setText: '' })
        }
      }
      else {
      }
    }
  }

  render() {
    return (
      <View style={[this.props.inputLayout, {}]}>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ marginTop: NormalizeLayout(12), marginRight: NormalizeLayout(15) }}>
            {this.props.icon}
          </View>
          <TextInput
            isFocused={false}
            // defaultValue={props.placeholder}
            //placeholderTextColor='black'
            style={[this.props.inputTextstyle, {}]}
            value={this.state.setText}
            maxLength={inputLength}
            onChangeText={this.props.onChangeText}

          />
        </View>
        <View style={this.props.sepView}></View>
      </View>
    )
  }
}