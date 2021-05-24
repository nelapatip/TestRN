import React from "react";
import Svg, { Path } from "react-native-svg";

const SvgProfileSelected = props => (
  <Svg width={20} height={20} {...props}>
    <Path
      d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10A10 10 0 0 0 10 0zm0 3a3 3 0 1 1-.003 6A3 3 0 0 1 10 3zm0 14.2a7.2 7.2 0 0 1-6-3.22c.03-1.99 4-3.08 6-3.08s5.97 1.09 6 3.08a7.2 7.2 0 0 1-6 3.22z"
      fill="#00A7E0"
      fillRule="nonzero"
    />
  </Svg>
);

export default SvgProfileSelected;
