import React from "react";
import Svg, { Path } from "react-native-svg";

const SvgAdd = props => (
  <Svg width={50} height={50} {...props}>
    <Path
      d="M25 0C11.193 0 0 11.193 0 25s11.193 25 25 25 25-11.193 25-25A25 25 0 0 0 25 0zm12.5 27.5h-10v10h-5v-10h-10v-5h10v-10h5v10h10v5z"
      fill="#00A7E0"
      fillRule="nonzero"
    />
  </Svg>
);

export default SvgAdd;
