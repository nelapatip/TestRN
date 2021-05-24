import React from "react";
import Svg, { Path } from "react-native-svg";

const SvgCheckedImg = props => (
  <Svg width={18} height={18} {...props}>
    <Path
      d="M9 0a9 9 0 1 0 0 18A9 9 0 0 0 9 0zM7.2 13.5L2.7 9l1.269-1.269L7.2 10.953l6.831-6.831L15.3 5.4l-8.1 8.1z"
      fill="#00A7E0"
      fillRule="nonzero"
    />
  </Svg>
);

export default SvgCheckedImg;
