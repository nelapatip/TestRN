import React from "react";
import Svg, { Path } from "react-native-svg";

const SvgStatus = props => (
  <Svg width={12} height={12} {...props}>
    <Path
      d="M6 0a6 6 0 1 0 0 12A6 6 0 0 0 6 0zM4.8 9l-3-3 .846-.846L4.8 7.3l4.554-4.552.846.852L4.8 9z"
      fill="#00A7E0"
      fillRule="nonzero"
    />
  </Svg>
);

export default SvgStatus;
