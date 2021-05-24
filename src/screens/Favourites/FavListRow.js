import React from 'react';
import { ScrollView, StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { connect } from "react-redux";
import { COLOR } from '../../constants/Colors'
import SvgRightArrow from '../../../assets/svgimage/RightArrow.js'
import SvgDocIcon from '../../../assets/svgimage/DocIcon.js'
import { Normalize, NormalizeLayout } from '../../utils/Scale'
import fonts from '../../utils/CortellisFonts'
import { CheckBox, StyleProvider } from 'native-base'
import { mapCountrytoCode } from '../../utils/Utility'
import getTheme from '../../../native-base-theme/components';
import material from '../../../native-base-theme/variables/material';


export default class FavListRow extends React.Component {

  constructor(props) {
    super(props);
    // if(this.props.item.regulatorySnapshotOutput.isRead==='Y')
    // alert("section-data in Alert details"+this.props.item.regulatorySnapshotOutput.title+"="+this.props.item.regulatorySnapshotOutput.isRead)
    this.state =
      {
        isChecked: this.props.isLiked,
        countries: '',
        isRead: (this.props.item.regulatorySnapshotOutput.isRead === 'N') ? false : true
      }
  }

  renderSelectionOption = () => {
    if (this.props.isSelectionModeOn) {
      return (
        <View style={[styles.rightRowView]}>

            <CheckBox
              style={{ marginRight: 10 }}
              checked={this.state.isChecked}
              onPress={() => {
                this.setState({ isChecked: !this.state.isChecked }, () => {
                  this.props.onChecked(this.state.isChecked, this.props.item.idrac)
                })
              }}
            />
        </View>
      )
    } else {
      return (
        <View style={styles.rightRowView}>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <SvgRightArrow />
          </View>
        </View>
      )
    }
  }

  componentWillReceiveProps(newProps) {
    if (newProps.isLiked !== this.state.isChecked) {
      this.setState({ isChecked: newProps.isLiked })
    }
  }

  componentDidMount() {
    mapCountrytoCode(this.props.item.regulatorySnapshotOutput.region, countries => {
      this.setState({ countries: countries })
    })
  }

  markAsRead = () => {
    if (!this.state.isRead) {
      this.setState({ isRead: true })
    }
  }

  combineActions = () => {
    if (this.props.isSelectionModeOn) {
      this.props.onPressed()
    }else{
      this.markAsRead()
       this.props.onPressed()
    }
  }

  render() {
    const { item } = this.props;
    if (!this.state.isRead) {
      return (

        <TouchableOpacity onPress={() => { this.combineActions(); }}>
          <View style={styles.rowStyle}>
            <View style={styles.leftRowView}>

              <View style={{ flexDirection: 'row' }}>
                <View style={styles.roundedButtonStyle} />
                <View style={[styles.countryBox, { marginTop: NormalizeLayout(10) }]}>
                  <Text style={styles.countryText}>{this.state.countries}</Text>
                </View>
                <View style={styles.FavDesc}>
                  <Text style={[styles.headingview, { fontWeight: '700' }]}>{item.regulatorySnapshotOutput.title}</Text>
                </View>

              </View>
              <View style={{ flexDirection: 'row', marginLeft: NormalizeLayout(41) }}>
                <SvgDocIcon style={{ marginTop: NormalizeLayout(12), height: NormalizeLayout(10), width: NormalizeLayout(7) }} />
                <Text style={styles.regionview} numberOfLines={2}>{item.regulatorySnapshotOutput.docType}</Text>

              </View>

            </View>
            {this.renderSelectionOption()}
          </View>
        </TouchableOpacity>
      )

    } else {
      return (
        <TouchableOpacity onPress={this.props.onPressed}>
          <View style={styles.rowStyle}>
            <View style={styles.leftRowView}>

              <View style={{ flexDirection: 'row' }}>
                <View style={[styles.countryBox, { marginTop: NormalizeLayout(10) }]}>
                  <Text style={styles.countryText}>{this.state.countries}</Text>
                </View>
                <View style={styles.FavDesc}>
                  <Text style={styles.headingview}>{item.regulatorySnapshotOutput.title}</Text>
                </View>

              </View>
              <View style={{ flexDirection: 'row', marginLeft: NormalizeLayout(41) }}>
                <SvgDocIcon style={{ marginTop: NormalizeLayout(12), height: NormalizeLayout(10), width: NormalizeLayout(7) }} />
                <Text style={styles.regionview} numberOfLines={2}>{item.regulatorySnapshotOutput.docType}</Text>

              </View>

            </View>
            {this.renderSelectionOption()}
          </View>
        </TouchableOpacity>
      )
    }
  }
}

const styles = StyleSheet.create({
  leftRowView: {
    marginLeft: NormalizeLayout(10),
    width: '70%'
  },
  rightRowView: {
    marginRight: NormalizeLayout(17),
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'space-around'
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
    lineHeight:NormalizeLayout(18)

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
    lineHeight: NormalizeLayout(18),
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
    lineHeight:NormalizeLayout(15),
    fontWeight: '900',
    textAlign: 'center',
    fontFamily: fonts.SourceSansProRegular,

  },
  FavDesc: {
    fontWeight: 'normal',
    fontFamily: fonts.SourceSansProRegular,
    flexWrap: 'wrap',
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
