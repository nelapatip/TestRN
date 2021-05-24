import React from "react";
import Svg, { Path } from "react-native-svg";

const SvgStar5 = props => (
  <Svg width={26} height={26} {...props}>
    <Path
      d="M26 9.907l-9.347-.848L13.001 0 9.347 9.073 0 9.907l7.101 6.473L4.966 26l8.033-5.105L21.034 26l-2.119-9.62L26 9.907zm-13 8.43l-4.888 3.107 1.3-5.858-4.317-3.941 5.695-.52L13 5.609l2.224 5.525 5.694.52L16.6 15.6l1.3 5.856-4.9-3.12z"
      fill={props.fill ? props.fill : "#616A6D"}
      fillRule="nonzero"
    />
  </Svg>
);

export default SvgStar5;
