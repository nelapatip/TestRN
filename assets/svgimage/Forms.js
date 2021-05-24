import React from "react";
import Svg, { Path } from "react-native-svg";

const SvgForms = props => (
  <Svg width={12} height={12} {...props}>
    <Path
      d="M6 0a6 6 0 1 1 0 12A6 6 0 0 1 6 0zm1 2H3v8h6.4V4.4L7 2zm.8 6.4H4.6v-.8h3.2v.8zm0-1.6H4.6V6h3.2v.8zm-1.2-2V2.6l2.2 2.2H6.6z"
      fill="#00A7E0"
      fillRule="nonzero"
    />
  </Svg>
);

export default SvgForms;
