import React from "react";
import Svg, { Path } from "react-native-svg";

const SvgCountry = props => (
  <Svg width={7} height={11} {...props}>
    <Path
      d="M3.5.932a3.5 3.5 0 0 0-3.5 3.5c0 2.625 3.5 6.5 3.5 6.5S7 7.057 7 4.432a3.5 3.5 0 0 0-3.5-3.5zm0 4.75a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z"
      fill="#00A7E0"
      fillRule="nonzero"
    />
  </Svg>
);

export default SvgCountry;
