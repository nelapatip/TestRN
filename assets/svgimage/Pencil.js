import React from "react";
import Svg, { Path } from "react-native-svg";

const SvgPencil = props => (
  <Svg width={16} height={16} {...props}>
    <Path
      d="M0 12.741V16h3.259l9.612-9.612-3.259-3.259L0 12.741zm16-9.482L12.741 0l-2.2 2.207 3.259 3.26L16 3.259z"
      fill="#00A7E0"
      fillRule="nonzero"
    />
  </Svg>
);

export default SvgPencil;
