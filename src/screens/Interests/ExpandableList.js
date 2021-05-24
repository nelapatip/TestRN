import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  ScrollView,
  LayoutAnimation,
  TouchableOpacity,
  RefreshControl,
  Button,
  Dimensions,
} from 'react-native';

import Tags from './Tags'
import { CONSTANTS } from '../../constants/Constants'
import ListView from "deprecated-react-native-listview";
const { height } = Dimensions.get('window');

class ExpandableList extends Component {
  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.listView;
    this.ScrollViewRef
    const map = new Map();

    if (props.openOptions) {
      props.openOptions.map((item) => map.set(item.toString(), true))
    }
    this.state = {
      memberOpened: map,
      screenHeight: 0,
      shouldScroll: false
    }
    this.listHeight = 0
  }

  // componentWillReceiveProps(nextProps) {
  //   const map = new Map();
  //   if (nextProps.openOptions) {
  //     nextProps.openOptions.map((item) => map.set(item.toString(), true));
  //   }
  //   this.setState({ memberOpened: map });
  // }

  static propTypes = {
    dataSource: PropTypes.array.isRequired,
    headerKey: PropTypes.string,
    memberKey: PropTypes.string,
    renderRow: PropTypes.func,
    renderSectionHeaderX: PropTypes.func,
    renderSectionFooterX: PropTypes.func,
    headerOnPress: PropTypes.func,
    isOpen: PropTypes.bool,
    openOptions: PropTypes.array,
  };

  static defaultProps = {
    headerKey: 'header',
    memberKey: 'member',
    isOpen: false,
  };

  _onPress = (i) => {
    this.setState((state) => {
      const memberOpened = new Map(state.memberOpened);
      memberOpened.set(i, !memberOpened.get(i)); // toggle
      return { memberOpened, shouldScroll: true };
    });

    LayoutAnimation.easeInEaseOut();
  };

  _renderRow = (rowData, sectionId, rowId) => { // eslint-disable-line
    const { renderRow, renderSectionHeaderX, renderSectionFooterX, headerKey, memberKey } = this.props;
    let memberArr = rowData[memberKey];
    let localArr = []
    let showMoreTitle = ''


    if (!this.state.memberOpened.get(rowId) || !memberArr) {
      memberArr = [];
    }

    memberArr.map((rowItem, index) => {
      localArr.push(rowItem)
    })

    let updatedSectionName = ''

    if (rowData[headerKey] === CONSTANTS.UserPreferencesScreen.TOPIC) {
      showMoreTitle = CONSTANTS.UserPreferencesScreen.MORE_TOPICS
      updatedSectionName = CONSTANTS.UserPreferencesScreen.TOPIC

    } else if (rowData[headerKey] === CONSTANTS.UserPreferencesScreen.COUNTRY_REGION || rowData[headerKey] === 'DB Country/Region' || rowData[headerKey] === 'MD Country/Region') {
      showMoreTitle = CONSTANTS.UserPreferencesScreen.MORE_REGIONS
      updatedSectionName = CONSTANTS.UserPreferencesScreen.COUNTRY_REGION

    } else if (rowData[headerKey] === CONSTANTS.UserPreferencesScreen.DOCUMENT_CATEGORY) {
      showMoreTitle = CONSTANTS.UserPreferencesScreen.MORE_CATEGORY
      updatedSectionName = CONSTANTS.UserPreferencesScreen.DOCUMENT_CATEGORY

    } else if (rowData[headerKey] === CONSTANTS.UserPreferencesScreen.DOCUMENT_TYPE || rowData[headerKey] === 'DB Document Type' || rowData[headerKey] === 'MD Document Type') {
      showMoreTitle = CONSTANTS.UserPreferencesScreen.MORE_TYPES
      updatedSectionName = CONSTANTS.UserPreferencesScreen.DOCUMENT_TYPE
    }else{
      updatedSectionName = rowData[headerKey]
    }

    return (
      <View>
        <TouchableOpacity onPress={() => this._onPress(rowId)}>
          {renderSectionHeaderX ? renderSectionHeaderX(updatedSectionName, rowId,
            !!this.state.memberOpened.get(rowId)) : null}
        </TouchableOpacity>
        <ScrollView contentContainerStyle={{ padding: 5 }} scrollEnabled={false} >

          <Tags
            initialTags={localArr}
            numberOfInitialTags={5}
            onTagPress={(index, tagLabel) => {
              this.props.onTagPress(index, tagLabel, rowData[headerKey])
            }
            }
            showMoreTitle={showMoreTitle}
          />
        </ScrollView>
      </View>

    );
  }

  render() {
    const { dataSource } = this.props;
    return (
      <ScrollView
        ref={instance => this.ScrollViewRef = instance}
      >
        {this.props.Header}
        <ListView
          onContentSizeChange={(contentWidth, contentHeight) => {

            if (this.state.shouldScroll) {
              let scrollX
              if (contentHeight > height - this.props.footerHeight) {
                scrollX = contentHeight - this.listHeight + this.props.footerHeight
              }
              this.ScrollViewRef.scrollTo({ x: 0, y: scrollX, animated: true })
            } else {
              this.listHeight = contentHeight

            }

          }}
          {...this.props}
          ref={instance => this.listView = instance}
          dataSource={this.ds.cloneWithRows(dataSource || [])}
          renderRow={this._renderRow}
          enableEmptySections={true}
        />
      </ScrollView>

    );
  }
}

export default ExpandableList;