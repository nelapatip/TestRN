import React from "react";
import Svg, { Path } from "react-native-svg";

const SvgBackArrow = props => (
  <Svg width={16} height={16} {...props}>
    <Path
      d="M8 16l1.455-1.455-5.506-5.506H16V6.961H3.948l5.507-5.506L8 0 0 8z"
      fill="#FFF"
      fillRule="nonzero"
    />
  </Svg>
);

export default SvgBackArrow;
