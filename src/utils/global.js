import { Dimensions, Platform } from 'react-native'

const guidelineBaseWidth_iOS = 375;
const guidelineBaseWidth_Android = 360;
const { width, height } = Dimensions.get('window');
const shortDimension = width < height ? width : height;

const maxScaleFactor = (Platform.OS === 'ios') ? 1.3 : 1.05;
let scaleFactor = (Platform.OS === 'ios') ? (shortDimension / guidelineBaseWidth_iOS) : shortDimension / guidelineBaseWidth_Android;
scaleFactor = scaleFactor > maxScaleFactor ? maxScaleFactor : scaleFactor;
const moderateScaleFactor = 1 + (scaleFactor - 1) * .5;

global.scaleFactor = scaleFactor
global.moderateScaleFactor = moderateScaleFactor