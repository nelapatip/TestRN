import React from 'react';
import { Text, View, StyleSheet, TextInput, SafeAreaView } from 'react-native';
import { COLOR } from '../../constants/Colors'
import { Normalize, NormalizeLayout } from '../../utils/Scale'
import { CONSTANTS } from '../../constants/Constants'
import SwitchListRow from './SwitchListRow'
import NavigationHeader from '../../utils/NavigationHeader';
import { InputSelection } from './InputSelection';

export default class SelectRegion extends React.Component {
  static navigationOptions = {
    title: CONSTANTS.SelectRegion.select,
    headerShown: false
  };


  constructor(props) {
    super(props);
    this.state = {
      // alertCount: 5,

    };
  }

  componentDidMount() {


  }


  render() {
    var countries=[]
      for(let i = 0; i < 10; i++){

        countries.push(
          <SwitchListRow text="India" isSelected={true}></SwitchListRow>

        )
      }
      return (
      <View>
        <SafeAreaView style={styles.SafeAreaViewTop} >
          <NavigationHeader title={CONSTANTS.SelectRegion.select} action={CONSTANTS.SelectRegion.done} backAction={this.backPress} nextAction={this.addPress} back={true}></NavigationHeader>
        </SafeAreaView>
        <ScrollView>
          <InputSelection inputTextstyle={styles.inputView} inputLayout={styles.inputLayout} sepView={styles.sepView} text={CONSTANTS.SelectRegion.find} />
         {countries}
      
</ScrollView>
      </View>
    );
  }


  backPress = () => {
    this.props.navigation.navigate('Alerts')
  }


  addPress = () => {
    this.props.navigation.navigate('Alerts')
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
    height: NormalizeLayout(23),
    marginLeft: NormalizeLayout(20),
    fontSize: Normalize(18),
    borderColor: COLOR.BLACK_TEXT,
    marginBottom: NormalizeLayout(11),
    borderWidth: 0,

  },
  inputLayout: {
    flexDirection: 'column',
    marginLeft: NormalizeLayout(24),
    marginRight: NormalizeLayout(24)

  },

  SafeAreaViewTop: {
    backgroundColor: COLOR.HEADER_BG
  }

});


