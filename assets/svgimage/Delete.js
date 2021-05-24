import React from "react";
import Svg, { Path } from "react-native-svg";

const SvgDelete = props => (
  <Svg width={16} height={20} {...props}>
    <Path
      d="M16 1.111v2.222H0V1.111h4L5.143 0h5.714L12 1.111h4zM1.143 4.445h13.714V20H1.143V4.445z"
      fill={props.fill ? props.fill : "#CF005B"}
      fillRule="nonzero"
    />
  </Svg>
);

export default SvgDelete;
