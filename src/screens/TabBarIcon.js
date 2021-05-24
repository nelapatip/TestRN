import React from "react";
import { Text, View, StyleSheet, Image } from "react-native";
import { COLOR } from '../constants/Colors'
import { Normalize, NormalizeLayout } from '../utils/Scale'
import fonts from '../utils/CortellisFonts'

const TabBarIcon = ({ name, color, focused, tabBar, icon, iconSelected, style, ...props }) => {
    return (
    <View style={[{ backgroundColor: focused ? COLOR.TAB_BG_COLOR : COLOR.WHITE }, tabBar ? styles.mainContainer : styles.mainContainerHideTab]}>
     <View style={[{backgroundColor:focused ? COLOR.THEME_COLOR: COLOR.WHITE},styles.lineView]}></View>     
      <View style={styles.icon}> 
      {focused ? iconSelected : icon} 
      </View>
      <Text style={[styles.name, { color: focused ? COLOR.BLACK_TEXT : COLOR.LIGHT_GRAY_TEXT }]}>{name}</Text>
    </View>
  )
}


const styles = StyleSheet.create({
  mainContainer: {
    height: 65,
    alignItems: 'center',
    flexDirection: 'column',
    width: '100%'
  },
  mainContainerHideTab: {
    height: 0,
    alignItems: 'center',
    flexDirection: 'column',
    width: '100%'
  },
  name: {
    fontSize: Normalize(11),
    marginTop: NormalizeLayout(5),
    marginBottom: NormalizeLayout(7),
    fontFamily: fonts.SourceSansProRegular,


  },
  icon: {
    fontSize: Normalize(20),
    marginTop: NormalizeLayout(10)
  },
  lineView: {
    width: '100%',
    height: NormalizeLayout(4),
  }
})
export default TabBarIcon;
