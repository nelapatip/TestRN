import React from "react";
import Svg, { Path } from "react-native-svg";

const SvgCollapsibleUp = props => (
  <Svg width={14} height={9} {...props}>
    <Path
      d="M12.748 8.251L7 2.503 1.252 8.251 0 6.999l7-7 7 7z"
      fill="#7A8183"
      fillRule="nonzero"
    />
  </Svg>
);

export default SvgCollapsibleUp;
