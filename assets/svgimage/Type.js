import React from "react";
import Svg, { Path } from "react-native-svg";

const SvgType = props => (
  <Svg width={10} height={10} {...props}>
    <Path
      d="M10 5.279L4.721 0H0v4.721L5.279 10 10 5.279zM1.681 2.442a.719.719 0 1 1 .002-1.438.719.719 0 0 1-.002 1.438z"
      fill="#00A7E0"
      fillRule="nonzero"
    />
  </Svg>
);

export default SvgType;
