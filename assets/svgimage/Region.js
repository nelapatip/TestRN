import React from "react";
import Svg, { Path } from "react-native-svg";

const SvgRegion = props => (
  <Svg width={12} height={12} {...props}>
    <Path
      d="M6 12a6.007 6.007 0 0 1-6-6 6.007 6.007 0 0 1 6-6 6.01 6.01 0 0 1 6 6 6.007 6.007 0 0 1-6 6zM6 2C4.343 2 3 3.254 3 4.8 3 6.9 6 10 6 10s3-3.1 3-5.2C9 3.254 7.657 2 6 2zm0 3.8c-.592 0-1.071-.448-1.071-1s.48-1 1.071-1c.592 0 1.071.448 1.071 1s-.48 1-1.071 1z"
      fill="#00A7E0"
      fillRule="nonzero"
    />
  </Svg>
);

export default SvgRegion;
