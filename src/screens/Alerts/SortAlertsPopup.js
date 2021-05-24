import React from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity,Modal ,TouchableHighlight} from 'react-native';
import { CheckBox } from 'native-base'
import { COLOR } from '../../constants/Colors'
import SvgCheckedImg from '../../../assets/svgimage/CheckedImg'

import { Normalize, NormalizeLayout } from '../../utils/Scale'
import { CONSTANTS } from '../../constants/Constants';

export default class SortAlertsPopup extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      checkboxValue: true,
      modalVisible: false,

    }
  }

  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }


  componentDidMount() {
  }


  render() {

    return (
<View style={{position:'absolute',backgroundColor:'red',flex:1,width:'100%',height:'100%'}}>
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
          }}>
        
        </Modal>

        <TouchableHighlight
          onPress={() => {
            this.setModalVisible(true);
          }}>
 {/* <View style={styles.mainview}> */}

         <View style={styles.layoutview}>
           <View style={styles.rowView}>
             <Text style={styles.header}>{CONSTANTS.SORT}</Text>
          </View>
           <View style={styles.rowView}>
             <Text style={styles.header}>{CONSTANTS.BY_DATE}</Text>
            <View style={[styles.checkbox]}>
             <CheckBox checked={this.state.dateCheckboxValue}
             />
             </View>
          </View>

         <View style={styles.rowView}>
           <Text style={styles.header}>{CONSTANTS.BY_NAME}</Text>
           <View style={[styles.checkbox]}>
           <CheckBox checked={this.state.nameCheckboxValue}
           />
             </View>
           </View>
           <TouchableOpacity >

            <Text style={styles.button}>{CONSTANTS.APPLY}</Text>
           </TouchableOpacity>
        </View>


{/* </View>      */}
   </TouchableHighlight>
      </View>
    );
  }
}


const styles = StyleSheet.create({

  rowView: {
    flexDirection: 'row',
    height: NormalizeLayout(56),
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  header: {
    color: COLOR.BLACK_TEXT,
    fontSize: Normalize(16),
    height: Normalize(20),
    justifyContent: 'center',
  },
  button: {
    color: COLOR.BUTTON_TEXT_COLOR,
    fontSize: Normalize(16),
    height: Normalize(20),
    justifyContent: 'center',
    width: '100%',
    alignItems: 'center',
    textAlign: 'center',
    marginBottom:Normalize(17)

  },
  sepview: {
    backgroundColor: COLOR.Gray_Sep,
    height: Normalize(2),
    width: '100%'
  },
  layoutview: {
    flexDirection: 'column',
    height: '40%',
    zIndex:3,
    backgroundColor:COLOR.WHITE,
    paddingLeft: NormalizeLayout(16),
    paddingRight: NormalizeLayout(16),

  },

  titleview: {
    justifyContent: 'center',
    height: '100%'
  },
  SafeAreaViewTop: {
    backgroundColor: COLOR.HEADER_BG,
  },
  checkbox: {
    marginTop: NormalizeLayout(17),
    height: NormalizeLayout(20),
    paddingRight: NormalizeLayout(10)
  },
  sepview: {
    backgroundColor: COLOR.Gray_Sep,
    height: Normalize(2),
    width: '100%'
  },
  
});
