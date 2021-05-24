import React from 'react';
import { ScrollView, StyleSheet, Text, View, Image, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { connect } from "react-redux";
import { COLOR } from '../../constants/Colors'
import SvgRightArrow from '../../../assets/svgimage/RightArrow.js'
import SvgDocIcon from '../../../assets/svgimage/DocIcon.js'
import { Normalize, NormalizeLayout } from '../../utils/Scale'
import fonts from '../../utils/CortellisFonts'
import { CheckBox, StyleProvider } from 'native-base'
import { getCountryCode } from '../../utils/Utility'

export default class FavouriteListRowSelectable extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isSelected: props.isSelected,
      countryCode: ''
    }
  }

  componentDidMount() {
    let region = this.props.item.regulatorySnapshotOutput.region
    let countryCode = getCountryCode(region)
    this.setState({ countryCode: countryCode })
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.countryCode != this.state.countryCode || 
        nextState.isSelected != this.state.isSelected) {
      return true
    }
    return false
  }
  componentWillReceiveProps(nextProps, nextState) {
    if (nextProps.isSelected != this.state.isSelected) {
      this.setState({ isSelected: nextProps.isSelected })
    }
  }

  renderDocumentRowInEditMode = () => {
    const { title, docType, isRead } = this.props.item.regulatorySnapshotOutput
    const { countryCode, isSelected } = this.state
    return (
      <TouchableWithoutFeedback onPress={() => { this.onDocumentSelection(); }}>
        <View style={styles.rowStyle}>
          <View style={styles.leftRowView}>
            <View style={{ flexDirection: 'row' }}>
              {(isRead == 'N') && <View style={styles.roundedButtonStyle} />}
              <View style={[styles.countryBox, { marginTop: NormalizeLayout(10) }]}>
                <Text style={styles.countryText}>{countryCode}</Text>
              </View>
              <View style={styles.FavDesc}>
                {(isRead == 'N') && <Text style={[styles.headingview, { fontWeight: '700' }]}>{title}</Text>}
                {(isRead == 'Y') && <Text style={[styles.headingview]}>{title}</Text>}
              </View>
            </View>
            <View style={{ flexDirection: 'row', marginLeft: NormalizeLayout(41) }}>
              <SvgDocIcon style={{ marginTop: NormalizeLayout(12), height: NormalizeLayout(10), width: NormalizeLayout(7) }} />
              <Text style={styles.regionview} numberOfLines={2}>{docType}</Text>
            </View>
          </View>
          <View style={styles.rightRowView}>
            <CheckBox style={styles.checkBoxStyle} checked={isSelected} onPress={() => { this.onDocumentSelection(); }}/>
          </View>
        </View>
      </TouchableWithoutFeedback>
    )
  }

  onDocumentSelection = () => {
    let documentId = this.props.item.idrac
    this.props.onSelection(!this.state.isSelected, documentId)
  }

  render() {
    return this.renderDocumentRowInEditMode()
  }
}

const styles = StyleSheet.create({
  leftRowView: {
    marginLeft: NormalizeLayout(10),
    width: '70%'
  },
  rightRowView: {
    marginRight: NormalizeLayout(35),
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkBoxStyle: {
    width: 22,
    height: 22,
    alignItems: 'center'
  },
  rowStyle: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between'
  },
  headingview: {
    color: COLOR.BLACK_TEXT,
    fontSize: Normalize(14),
    fontFamily: fonts.SourceSansProRegular,


  },
  topicview: {
    marginBottom: NormalizeLayout(10),
    fontSize: Normalize(14),
    marginLeft: NormalizeLayout(18),
    height: NormalizeLayout(18),
    color: COLOR.BLACK_TEXT,
    justifyContent: 'center',
    fontFamily: fonts.SourceSansProRegular,

  },
  typeview: {
    marginBottom: NormalizeLayout(26),
    fontSize: Normalize(14),
    marginLeft: NormalizeLayout(5),
    color: COLOR.GRAY_TEXT,
    justifyContent: 'center',
    fontFamily: fonts.SourceSansProRegular,

  },
  regionview: {
    fontFamily: fonts.SourceSansProRegular,
    marginBottom: NormalizeLayout(5),
    marginLeft: NormalizeLayout(5),
    marginTop: NormalizeLayout(8),
    marginBottom: NormalizeLayout(14),
    fontSize: Normalize(14),
    fontWeight: 'normal',
    color: COLOR.GRAY_TEXT,
    justifyContent: 'center',
    height: NormalizeLayout(18),
    fontFamily: fonts.SourceSansProRegular,


  },
  dayText: {
    color: COLOR.LIGHT_GRAY_TEXT,
    position: 'absolute',
    right: NormalizeLayout(15),
    top: NormalizeLayout(20),
    fontSize: Normalize(11),
    height: NormalizeLayout(13),
    fontFamily: fonts.SourceSansProRegular,


  },
  countryBox: {
    height: NormalizeLayout(31),
    width: NormalizeLayout(31),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: NormalizeLayout(5),
    borderColor: '#B7BABD',
    fontFamily: fonts.SourceSansProRegular,


  }, countryText: {
    fontFamily: fonts.SourceSansProBold,
    color: COLOR.THEME_COLOR,
    fontSize: NormalizeLayout(10),
    fontWeight: '900',
    textAlign: 'center',
    fontFamily: fonts.SourceSansProRegular,

  },
  FavDesc: {
    fontWeight: 'normal',
    fontFamily: fonts.SourceSansProRegular,
    // flexWrap: 'wrap',
    marginLeft: NormalizeLayout(10),
    marginTop: NormalizeLayout(15),
  },
  roundedButtonStyle: {
    position: 'absolute',
    top: NormalizeLayout(9),
    left: NormalizeLayout(-4),
    zIndex: 2,
    backgroundColor: COLOR.THEME_COLOR,
    width: NormalizeLayout(10),
    height: NormalizeLayout(10),
    borderRadius: NormalizeLayout(8),

  },

});
