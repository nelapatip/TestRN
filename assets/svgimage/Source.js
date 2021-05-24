import React from "react";
import Svg, { Path } from "react-native-svg";

const SvgSource = props => (
  <Svg width={12} height={12} {...props}>
    <Path
      d="M6 0a6 6 0 1 1 0 12A6 6 0 0 1 6 0zm3.4 6.187H3.598V10h5.758v-.726H4.13v-2.36H9.4v-.727zm-4.915 1.03v.725h4.574v-.726H4.485zm0 1.028v.726h4.574v-.726H4.485zm2.249-3.158H3.53v-2.36h3.203l.531-.004V5.62l.665-.545.664.545V2.716l.345-.002V2H3v3.813h3.734v-.726zM3.887 3.029v.726h2.847v-.726H3.887zm0 1.029v.726h2.847v-.726H3.887z"
      fill="#00A7E0"
      fillRule="nonzero"
    />
  </Svg>
);

export default SvgSource;
