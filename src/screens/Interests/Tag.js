import React, { Component } from "react";
import PropTypes from "prop-types";
import { View, Text, TextInput, TouchableOpacity } from "react-native";

import styles from "./styles";

class Tag extends Component {
  constructor(props) {
    super(props);

    this.state={status : this.props.status}
    this.onClick = this.onClick.bind(this)
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.status != this.props.status){
      this.setState({status: nextProps.status})
    }
  }



  onClick() {
    { this.props.onPress(this.setState({status: !this.state.status})) }
  }

  render() {
    return (
      <TouchableOpacity style={!this.state.status ? [styles.tag, this.props.tagContainerStyle] : [styles.selectedTag]} onPress={() => this.onClick()}>
        <Text style={!this.state.status ?  [styles.tagLabel, this.props.tagTextStyle]: [styles.tagLabel,{color:'white'}]}>{this.props.label}</Text>
      </TouchableOpacity>
    )
  }


}

Tag.propTypes = {
  label: PropTypes.string.isRequired,
  onPress: PropTypes.func
};

export default Tag;
