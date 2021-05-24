import React from "react";
import Svg, { Path } from "react-native-svg";

const SvgArrow = props => (
  <Svg width={9} height={14} {...props}>
    <Path
      d="M0 12.748L1.252 14l7-7-7-7L0 1.252 5.748 7z"
      fill="#7A8183"
      fillRule="nonzero"
    />
  </Svg>
);

export default SvgArrow;
