import React from 'react';
import { ScrollView, StyleSheet, Text, View, Button, TouchableOpacity } from 'react-native';

import { requestPerson, connectionState } from "../actions/OfflineActions";
import { connect } from "react-redux";

import NetInfo from "@react-native-community/netinfo";

import ExpandableList from './Interests/ExpandableList'
import ExpandableSection from './Interests/ExpandableSection'


import Tags from '../screens/Interests/Tags'
import SvgLogoColored from '../../assets/svgimage/LogoColored'
import { Normalize, NormalizeLayout } from '../utils/Scale'
import Modal from "react-native-modal";

const titleQues = 'What are you interested in?'
const bottomText = 'Optional. We use this information to provide a better experience. This information is stored locally and Clarivate have no access to it.'

class RegisterScreen extends React.Component {
  // static navigationOptions = {
  //   title: 'Request A Demo',
  // };

  componentDidMount() {
    NetInfo.isConnected.addEventListener('connectionChange', this._handleConnectionChange);
  }

  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener('connectionChange', this._handleConnectionChange);
  }

  _handleConnectionChange = (isConnected) => {
    this.props.dispatch(connectionState({ status: isConnected }));
  };

  _renderSection = (section, sectionId, isOpen) => {
    return (
      <ExpandableSection title={section} sectionId={sectionId} isOpen={isOpen} isLastItem={(sectionId > 3) ? true : false} />
    )
  };



  render() {
    return (
      <View style={{ flex: 1 }}>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  isConnected: state.offlineReducer.isConnected,

});

export default connect(mapStateToProps)(RegisterScreen);
