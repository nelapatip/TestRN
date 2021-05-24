import React from "react";
import Svg, { Path } from "react-native-svg";

const SvgAlerts = props => (
  <Svg width={17} height={20} {...props}>
    <Path
      d="M8.372 20a1.85 1.85 0 0 0 1.851-1.851h-3.7A1.85 1.85 0 0 0 8.372 20zm6.512-5.581V8.837a6.505 6.505 0 0 0-5.117-6.353V0h-2.79v2.484A6.505 6.505 0 0 0 1.86 8.837v5.582L0 16.279v.93h16.744v-.93l-1.86-1.86z"
      fill="#B7BABD"
      fillRule="nonzero"
    />
  </Svg>
);

export default SvgAlerts;
