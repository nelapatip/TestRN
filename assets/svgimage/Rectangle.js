import React from "react";
import Svg, { Rect } from "react-native-svg";

const SvgRectangle = props => (
  <Svg width={22} height={22} {...props}>
    <Rect
      width={20}
      height={20}
      rx={4}
      transform="translate(1 1.273)"
      fill="#FFF"
      fillRule="nonzero"
      stroke="#616A6D"
    />
  </Svg>
);

export default SvgRectangle;
