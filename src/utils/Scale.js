import { PixelRatio } from 'react-native';


export function Normalize(size) {

  return PixelRatio.roundToNearestPixel(size * global.scaleFactor) 

}

export function NormalizeLayout(size) {

  return PixelRatio.roundToNearestPixel(size * global.moderateScaleFactor) 

}
