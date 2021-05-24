import React from "react";
import PropTypes from "prop-types";
import { View, Text, TextInput, TouchableOpacity, Button } from "react-native";

import Tag from "./Tag";
import styles from "./styles";
import { Normalize, NormalizeLayout } from '../../utils/Scale'


class Tags extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tags: props.initialTags,
      text: props.initialText,
      numberOfInitialTags: props.numberOfInitialTags
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (
      nextProps.initialTags === prevState.initialTags &&
      nextProps.initialText === prevState.initialText
    ) {
      return null;
    }
    return {
      tags: nextProps.initialTags,
      text: nextProps.initialText,
    };
  }

  componentWillReceiveProps(props) {
    const { initialTags = [], initialText = " " } = props;

    this.setState({
      tags: initialTags,
      text: initialText
    });
  }

  renderConditionalTags = () => {
      return (
        this.state.tags.slice(0, this.state.numberOfInitialTags).map((tag, i) => (
          <Tag
            key={i}
            label={this.props.profileTags ? tag : tag.title}
            onPress={e => this.props.onTagPress(this.props, i)}
            status={tag.isSelected}
            tagContainerStyle={this.props.tagContainerStyle}
            tagTextStyle={this.props.tagTextStyle}
          />
        ))
      )
  }

  shouldShowMoreVisible = () => {
    if (this.props.initialTags.length > this.state.numberOfInitialTags){
      return true
    }
    return false
  }

  render() {
    return (
      <View>
        <View
          style={[styles.container, this.props.containerStyle, this.props.style]}
        >
          {this.renderConditionalTags()}
        </View>
        <View>
          {this.shouldShowMoreVisible() &&
            <TouchableOpacity style={{paddingTop: Normalize(20), paddingBottom: Normalize(20)}} onPress={() => {this.setState({numberOfInitialTags: this.state.numberOfInitialTags*2}) }}>
              <Text style={styles.showMoreText}>Show more {this.props.showMoreTitle}</Text>
            </TouchableOpacity>}
        </View>
      </View>
    );
  }
}

Tags.defaultProps = {
  initialTags: [],
  initialText: " ",
  isSelected: false,
  profileTags: false
};

Tags.propTypes = {
  initialText: PropTypes.string,
  initialTags: PropTypes.arrayOf(PropTypes.string),
  onChangeTags: PropTypes.func,
  onTagPress: PropTypes.func,
  containerStyle: PropTypes.object,
  style: PropTypes.object,
  inputStyle: PropTypes.object,
  tagContainerStyle: PropTypes.object,
  tagTextStyle: PropTypes.object,
  isSelected: PropTypes.bool,
  profileTags: PropTypes.bool

};

export { Tag };
export default Tags;
