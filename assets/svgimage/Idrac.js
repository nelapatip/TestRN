import React from "react";
import Svg, { Path } from "react-native-svg";

const SvgIdrac = props => (
  <Svg width={12} height={12} {...props}>
    <Path
      d="M6 12a6.007 6.007 0 0 1-6-6 6.007 6.007 0 0 1 6-6 6.01 6.01 0 0 1 6 6 6.007 6.007 0 0 1-6 6zM4.764 7.46h1.4L5.888 9.8h.841l.275-2.34h1.128v-.912h-1.02L7.305 5h1.067v-.912h-.96L7.664 2h-.815l-.276 2.088h-1.4L5.425 2h-.828l-.264 2.088H3.24V5h.973L4.02 6.548H3v.912h.923L3.635 9.8h.841l.288-2.339V7.46zm1.512-.912H4.86L5.052 5h1.416l-.192 1.547v.001z"
      fill="#00A7E0"
      fillRule="nonzero"
    />
  </Svg>
);

export default SvgIdrac;
