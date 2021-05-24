import React from "react";
import Svg, { Path } from "react-native-svg";

const SvgLanguages = props => (
  <Svg width={12} height={12} {...props}>
    <Path
      d="M6 0a6 6 0 1 1 0 12A6 6 0 0 1 6 0zm0 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm-.4 7.172a3.195 3.195 0 0 1-2.716-3.888L4.8 7.2v.4a.802.802 0 0 0 .8.8v.772zm2.76-1.016A.793.793 0 0 0 7.6 7.6h-.4V6.4c0-.22-.18-.4-.4-.4H4.4v-.8h.8c.22 0 .4-.18.4-.4V4h.8a.802.802 0 0 0 .8-.8v-.164a3.193 3.193 0 0 1 1.16 5.12z"
      fill="#00A7E0"
      fillRule="nonzero"
    />
  </Svg>
);

export default SvgLanguages;
