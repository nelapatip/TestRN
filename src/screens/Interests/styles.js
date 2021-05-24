import { StyleSheet } from "react-native";
import { Normalize, NormalizeLayout } from '../../utils/Scale'
import { COLOR } from '../../constants/Colors'
import fonts from '../../utils/CortellisFonts'

export default StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: 'center'
  },
  tag: {
    justifyContent: "center",
    backgroundColor: "rgb(233, 246, 251)",
    borderRadius: Normalize(20),
    paddingLeft: 15,
    paddingRight: 15,
    height: Normalize(40),
    margin: Normalize(5)
  },
  selectedTag: {
    justifyContent: "center",
    backgroundColor: "#00A7E0",
    borderRadius: Normalize(20),
    paddingLeft: 15,
    paddingRight: 15,
    height: Normalize(40),
    margin: Normalize(5)
  },
  tagLabel: {
    fontFamily: fonts.SourceSansProRegular,
    fontSize: Normalize(14),
    color: "#00A7E0"
  },
  showMoreText: {
    fontFamily: fonts.SourceSansProBold,
    color: COLOR.THEME_COLOR,
    fontSize: Normalize(14),
    textAlign: 'center'
  }
});
