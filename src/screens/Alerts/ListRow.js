import React from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import  AsyncStorage  from "@react-native-community/async-storage";
import { connect } from "react-redux";
import { COLOR } from '../../constants/Colors'
import SvgProfile from '../../../assets/svgimage/Profile.js'
import SvgType from '../../../assets/svgimage/Type.js'
import SvgCountry from '../../../assets/svgimage/Country.js'
import SvgRightArrow from '../../../assets/svgimage/RightArrow.js'
import fonts from '../../utils/CortellisFonts'
import { CheckBox, StyleProvider } from 'native-base'
import { mapCodeToCountry, mapTopicsIfExists } from '../../utils/Utility'
import moment from 'moment'

import { Normalize, NormalizeLayout } from '../../utils/Scale'

export default class ListRow extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      isChecked: this.props.isLiked,
      countries: '',
      docTypes: '',
      isRead: ''
    }
  }

  componentDidMount() {
    AsyncStorage.getItem('userObject', (err, result) => {
      if (err) {
      } else {
        if (result == null) {
          console.log("null value recieved", result);
        } else {
          userData = JSON.parse(result)
          let emailLocal = userData['1p:eml']
          mapCodeToCountry(emailLocal, this.props.item.regions, countries => {
            this.setState({ countries: countries })
          })
          mapTopicsIfExists(emailLocal, this.props.item.docTypes, docTypes => {
            this.setState({ docTypes: docTypes })
          })
        }
      }
    })

    this.checkForReadStatus(this.props)
  }


  componentWillReceiveProps(newProps) {
    if (newProps.isLiked !== this.state.isChecked) {
      this.setState({ isChecked: newProps.isLiked })
    }
    this.checkForReadStatus(newProps)

    // if (newProps.item.isNew !== this.props.item.isNew) {
    //   this.setState({ isRead: (newProps.item.isNew === 'Y') ? false : true })
    // }
  }

  checkForReadStatus = (obj) => {
    let readArrCollection = []
    let notificationObj = obj.item.notifications[0]
    notificationObj.documents.map(item => {
      readArrCollection.push(item.regulatorySnapshotOutput.isRead)
    })
    this.setState({isRead : !readArrCollection.includes("N")})
  }

  timeDifference(current, previous) {

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerDay) {
      return 'TODAY';
    }

    else if (elapsed < msPerMonth) {
      if (Math.round(elapsed / msPerDay) == 1) {
        return Math.round(elapsed / msPerDay) + ' DAY AGO';
      }
      else {
        return Math.round(elapsed / msPerDay) + ' DAYS AGO';
      }
    }

    else if (elapsed < msPerYear) {
      return Math.round(elapsed / msPerMonth) + ' MONTHS AGO';
    }

    else {
      return Math.round(elapsed / msPerYear) + ' YEAR AGO';
    }
  }

  renderSelectionOption = () => {
    if (this.props.isEditModeOn) {
      return (
        <View style={[styles.rightRowView]}>
          <CheckBox
            style={styles.checkBoxStyle}
            checked={this.state.isChecked}
            onPress={() => {
              this.props.onChecked(!this.state.isChecked, this.props.item)
              // this.setState({ isChecked: !this.state.isChecked }, () => {
              //   this.props.onChecked(this.state.isChecked, this.props.item)
              // })
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

  getDateFromTimestamp = (timestamp) => {
    let spaceIndex = timestamp.indexOf(' ')
    if (spaceIndex != -1) {
      timestamp = timestamp.substring(0, spaceIndex)
    }
    return timestamp
  }

  combineActions = () => {
    if (this.props.isEditModeOn) {
      this.props.onPressed()
      this.props.onChecked(!this.state.isChecked, this.props.item)
    } else {
      this.props.onPressed()
    }
  }

  render() {
    var date = new Date().setHours(0, 0, 0);
    var todate = moment.utc(this.props.item.alertTimestamp , 'DD-MMM-YY hh:mm:ss a')
    var daytext = this.timeDifference(date, todate)

    return (
      <TouchableOpacity activeOpacity={0.7} onPress={() => { this.combineActions() }}>
        <View style={styles.rowStyle}>
          <View style={styles.leftRowView}>
            <View style={{ flexDirection: 'row' }}>
              <View style={!this.state.isRead ? styles.roundedButtonStyle : styles.noButtonStyle}>
              </View>
              <View style={{  }}>
                <Text ellipsizeMode='tail' style={[{ fontFamily: !this.state.isRead ? fonts.SourceSansProBold : fonts.SourceSansProRegular }, styles.headingview]}>{this.props.item.alertName}</Text>
              </View>
            </View>

            <Text style={[styles.topicview]}>{this.props.item.prodCategories}</Text>
            <View style={{ flexDirection: 'row', marginLeft: NormalizeLayout(20) }}>
              <SvgCountry style={{ marginTop: NormalizeLayout(15), height: NormalizeLayout(10), width: NormalizeLayout(7) }} />
              <Text style={styles.regionview} numberOfLines={2} ellipsizeMode='tail'>{(this.state.countries == null || this.state.countries == '') ? 'N/A' : this.state.countries}</Text>

            </View>
            <View style={{ flexDirection: 'row', marginLeft: Normalize(20) }}>
              <SvgType style={{ marginTop: NormalizeLayout(5), height: NormalizeLayout(10), width: NormalizeLayout(7) }} />
              <Text style={styles.typeview}>{(this.state.docTypes == null || this.state.docTypes == '') ? 'N/A' : this.state.docTypes}</Text>
            </View>

          </View>
          <Text style={styles.dayText}>{daytext}</Text>
          <View style={styles.rightRowView}>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              {this.renderSelectionOption()}
              {/* <View style={styles.whiteRoundedStyle}>
               </View>
              */}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    )

  }
}

const styles = StyleSheet.create({
  leftRowView: {
    marginLeft: NormalizeLayout(10),
    width: '70%'
  },
  rightRowView: {
    marginRight: NormalizeLayout(15),
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'space-around'
  },
  rowStyle: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between'
  },
  checkBoxStyle: {
    width: 22,
    height: 22,
    alignItems: 'center'
  },
  headingview: {
    color: COLOR.THEME_COLOR,
    marginLeft: NormalizeLayout(8),
    marginTop: NormalizeLayout(18),
    fontSize: Normalize(18),
    justifyContent: 'center',
    maxHeight: Normalize(100),

  },
  topicview: {
    fontSize: Normalize(14),
    marginLeft: NormalizeLayout(18),
    lineHeight: NormalizeLayout(18),
    color: COLOR.BLACK_TEXT,
    justifyContent: 'center',
    fontFamily: fonts.SourceSansProRegular
  },
  typeview: {
    marginBottom: NormalizeLayout(26),
    fontSize: Normalize(14),
    marginLeft: NormalizeLayout(5),
    color: COLOR.GRAY_TEXT,
    fontFamily: fonts.SourceSansProRegular,
    justifyContent: 'center'
  },
  regionview: {
    marginBottom: NormalizeLayout(5),
    marginLeft: NormalizeLayout(5),
    marginTop: NormalizeLayout(12),
    fontSize: Normalize(14),
    color: COLOR.GRAY_TEXT,
    justifyContent: 'center',
    maxHeight: Normalize(40),
    fontFamily: fonts.SourceSansProRegular,
  },
  dayText: {
    color: COLOR.LIGHT_GRAY_TEXT,
    position: 'absolute',
    right: NormalizeLayout(15),
    top: NormalizeLayout(20),
    fontSize: Normalize(12),
    height: NormalizeLayout(16),
    fontFamily: fonts.SourceSansProRegular,


  },
  roundedButtonStyle: {
    marginTop: NormalizeLayout(25),
    backgroundColor: COLOR.THEME_COLOR,
    width: NormalizeLayout(10),
    height: NormalizeLayout(10),
    borderRadius: NormalizeLayout(8),

  },
  noButtonStyle: {
    marginTop: NormalizeLayout(25),
    width: NormalizeLayout(10),
    height: NormalizeLayout(10),

  },
  whiteRoundedStyle: {
    marginTop: NormalizeLayout(26),
    backgroundColor: COLOR.BLACK_HEADER_TEXT,
    width: NormalizeLayout(18),
    height: NormalizeLayout(18),
    borderRadius: NormalizeLayout(16),
    borderColor: '#B7BABD',
    borderWidth: NormalizeLayout(1)
  },
  sepview: {
    height: NormalizeLayout(1),
    width: '100%',
    backgroundColor: COLOR.Gray_Sep
  }

});
