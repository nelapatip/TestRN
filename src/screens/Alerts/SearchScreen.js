import React from 'react';
import { Text, View, StyleSheet, FlatList, TextInput, ScrollView, SafeAreaView, Platform, BackHandler } from 'react-native';

import { COLOR } from '../../constants/Colors'
import { Normalize, NormalizeLayout } from '../../utils/Scale'
import { CONSTANTS } from '../../constants/Constants'
import SwitchListRow from './SwitchListRow'
import NavigationHeader from '../../utils/NavigationHeader';
import fonts from '../../utils/CortellisFonts';
import SvgCombinedShape from '../../../assets/svgimage/CombinedShape';
import SvgSearch from '../../../assets/svgimage/Search';


export default class SearchScreen extends React.Component {

  static navigationOptions = {
    headerShown: false,
    title: CONSTANTS.SelectRegion.select
  };


  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      searchedSectionList: [],
      headerTitle: ''
    };
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);


  }

  componentWillMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    var paramsList = this.fetchParams()
    this.sortAndSearchList(paramsList[2].data, paramsList[1].member)
    this.setState({
      headerTitle: paramsList[0]
    })
  }

  fetchParams = () => {
    const { navigation } = this.props;
    var paramsList = []
    let sections = navigation.getParam('Sections');
    let title = navigation.getParam('title');
    let localSectionToShow = navigation.getParam('SectionToShow');
    paramsList.push(title, sections, localSectionToShow)
    return paramsList
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
  }

  handleBackButtonClick() {
    this.props.navigation.goBack();
    return true;
  }


  sortAndSearchList = (localSectionToShow, list) => {
    var sectionList = this.uniqueArray([...localSectionToShow, ...list]);
    this.setState({
      searchedSectionList: sectionList
    })
  };

  uniqueArray = (arr) => {
    return arr.reduce((acc, current) => {
      const x = acc.find(item => item.title === current.title);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);
  }

  renderSeparator = () => {
    return (
      <View style={styles.separatorview}>
      </View>
    );
  };

  SearchList = () => {
    return (
      <FlatList
        data={this.state.searchedSectionList}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={this.renderSeparator}
        ListEmptyComponent={<NoSearch />}
        renderItem={({ item }) =>
          <SwitchListRow text={item.title} value={item.isSelected}
            onToggleRemember={(value) => { this.props.navigation.state.params.onSearchData(item, value) }}>>
          </SwitchListRow>
        }
      />
    );
  }


  render() {
    return (
      <View style={{ flex: 1 }}>
        <SafeAreaView style={styles.SafeAreaViewTop} >
          <NavigationHeader showActionButton={true} title={this.state.headerTitle} action={CONSTANTS.SelectRegion.done} backAction={this.backPress} actionPress={this.donePress} back={true} />
        </SafeAreaView>
        <ScrollView>

          <View style={styles.inputLayout}>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ marginTop: Platform.OS === 'ios' ? NormalizeLayout(7) : NormalizeLayout(12), marginRight: NormalizeLayout(15) }}>
                <SvgSearch />
              </View>
              <TextInput
                isFocused={false}
                style={styles.inputView}
                placeholder={CONSTANTS.SelectRegion.find}
                placeholderTextColor={COLOR.GRAY_TEXT}
                value={this.state.searchText}
                maxLength={70}
                onChangeText={this.changeSearchText}

              />
            </View>
            <View style={styles.sepView}></View>
          </View>
          {this.SearchList()}

        </ScrollView>
      </View>
    );
  }

  changeSearchText = (text) => {
    if (text != "") {
      this.setState({ searchText: text }, () => {
        var initialList = this.fetchInitialUniqueList()
        if (initialList != undefined && initialList.length > 0) {
          var changedList = initialList ? initialList.filter(item => item.title.toLowerCase().includes(this.state.searchText.toLowerCase())) : []
          this.setState({ searchedSectionList: changedList })
        }

      })
    }
    else {
      this.setState({ searchText: text })
      var paramList = this.fetchParams()
      if (paramList != undefined && paramList.length > 0) {
        this.sortAndSearchList(paramList[2].data, paramList[1].member)
      }

    }


  }


  fetchInitialUniqueList = () => {
    const { navigation } = this.props;
    var sectionList = []
    var paramList = this.fetchParams()
    if (paramList != undefined && paramList.length > 0) {
      sectionList = this.uniqueArray([...paramList[2].data, ...paramList[1].member]);
      return sectionList
    }

  }


  onCheckedTrue = () => {
    alert('check true')
  }
  backPress = () => {
    this.props.navigation.goBack()
  }
  donePress = () => {
    this.props.navigation.goBack()
  }

}

const styles = StyleSheet.create({

  header: {
    color: COLOR.BLACK,
    marginLeft: NormalizeLayout(16),
    fontSize: Normalize(12),
    height: Normalize(15),
    fontSize: Normalize(12),
    fontWeight: 'bold',
  },
  sepview: {
    backgroundColor: COLOR.Gray_Sep,
    marginTop: NormalizeLayout(29),
    height: Normalize(2),
    width: '100%'
  },
  inputView: {
    width: '85%',
    lineHeight: NormalizeLayout(23),
    fontSize: Normalize(18),
    borderColor: COLOR.BLACK_TEXT,
    borderWidth: 0,
    fontFamily: fonts.SourceSansProRegular,
    marginBottom: Platform.OS === 'ios' ? NormalizeLayout(11) : 0,
  },

  inputLayout: {
    width: '85%',
    flexDirection: 'column',
    marginLeft: NormalizeLayout(24),
    marginRight: NormalizeLayout(24),
    marginTop: NormalizeLayout(18),
    height: NormalizeLayout(45),
  },

  SafeAreaViewTop: {
    backgroundColor: COLOR.HEADER_BG
  },
  sepView: {
    height: NormalizeLayout(1),
    backgroundColor: COLOR.THEME_COLOR,
    marginBottom: NormalizeLayout(30)
  },
  newContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    marginTop: Platform.OS == 'ios' ? NormalizeLayout(0) : NormalizeLayout(10),
    justifyContent: 'center',
  },
  noHeader: {
    color: '#3C464A',
    marginLeft: NormalizeLayout(10),
    fontSize: Normalize(18),
    height: NormalizeLayout(23),
    fontFamily: fonts.SourceSansProItalic,
    marginTop: NormalizeLayout(20)
  }

});

const NoSearch = (props) => {
  return (
    <View style={styles.newContainer}>
      <SvgCombinedShape />
      <Text style={styles.noHeader}>{CONSTANTS.SelectRegion.no_search}</Text>

    </View>

  )
}
