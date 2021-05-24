import React from "react";
import Svg, { Path } from "react-native-svg";

const SvgVersion = props => (
  <Svg width={12} height={12} {...props}>
    <Path
      d="M6 0a6 6 0 1 1 0 12A6 6 0 0 1 6 0zm3.28 7a3.43 3.43 0 0 1-6.709-1A3.429 3.429 0 0 1 6 2.571V2a4 4 0 1 0 3.874 5H11L9.5 5l-.3.4L8 7h1.28zm-4.268-.093h1.103L5.012 5.795v1.112zm.289-1.403l1.103 1.112 3.571-3.603L8.872 1.9 5.301 5.504z"
      fill="#00A7E0"
      fillRule="nonzero"
    />
  </Svg>
);

export default SvgVersion;
