import React from "react";
import Svg, { Path } from "react-native-svg";

const SvgCollapsibleDown = props => (
  <Svg width={14} height={9} {...props}>
    <Path
      d="M1.252-.001L7 5.747l5.748-5.748L14 1.251l-7 7-7-7z"
      fill="#7A8183"
      fillRule="nonzero"
    />
  </Svg>
);

export default SvgCollapsibleDown;
