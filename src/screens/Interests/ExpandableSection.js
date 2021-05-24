import React, { Component } from 'react'
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Alert,
    Linking,
    Platform,
    StyleSheet
  } from 'react-native'
  import { Normalize, NormalizeLayout } from '../../utils/Scale'
  import SvgCollapsibleDown from '../../../assets/svgimage/CollapsibleDown'
  import SvgCollapsibleUp from '../../../assets/svgimage/CollapsibleUp'
  import { COLOR } from '../../constants/Colors'
  import fonts from '../../utils/CortellisFonts'


  const styles = StyleSheet.create({
    SectionStyle: {
        height: NormalizeLayout(65),
        width: '100%',
        justifyContent: 'center',
        backgroundColor: '#FAFBFC',
    }, InnerSectionStyle: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingRight: NormalizeLayout(16),
    },
    SectionTitle: {
        color: COLOR.LIGHT_GRAY_TEXT,
        fontFamily: fonts.SourceSansProBold,
        fontSize: Normalize(14),
        marginLeft: NormalizeLayout(16),
    },
})  

class ExpandableSection extends Component {
    constructor(props) {
        super(props)
      
    }
  
    render() {
        return (
            <View style={styles.SectionStyle}>

                <View style={styles.InnerSectionStyle}>
                    <Text style={styles.SectionTitle}>{this.props.title}</Text>
                    {this.props.isOpen ?<SvgCollapsibleUp/>  : <SvgCollapsibleDown/>}
                </View>
            </View>
        )
    }
}

export default ExpandableSection