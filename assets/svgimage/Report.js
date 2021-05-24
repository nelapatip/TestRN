import React from "react";
import Svg, { Path } from "react-native-svg";

const SvgReport = props => (
  <Svg width={10} height={12} {...props}>
    <Path
      d="M7.368 0H0v8.421h1.053V1.053h6.315V0zm-.526 2.105L10 5.263v6.316H2.105V2.105h4.737zm-.526 3.684h2.895L6.316 2.895v2.894z"
      fill="#00A7E0"
      fillRule="nonzero"
    />
  </Svg>
);

export default SvgReport;
