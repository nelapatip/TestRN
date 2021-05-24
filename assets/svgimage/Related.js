import React from "react";
import Svg, { Path } from "react-native-svg";

const SvgRelated = props => (
  <Svg width={26} height={15} {...props}>
    <Path
      d="M0 9h3V6H0v3zm0 6h3v-3H0v3zM0 3h3V0H0v3zm6 6h20V6H6v3zm0 6h20v-3H6v3zM6 0v3h20V0H6z"
      fill= {props.fill ? props.fill : "#616A6D"}
      fillRule="nonzero"
    />
  </Svg>
);

export default SvgRelated;
