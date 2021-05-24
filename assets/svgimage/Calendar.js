import React from "react";
import Svg, { Path } from "react-native-svg";

const SvgCalendar = props => (
  <Svg width={12} height={14} {...props}>
    <Path
      d="M9.333 7.333H6v3.333h3.333V7.333zM8.667 0v1.333H3.333V0H2v1.333H0v12h12v-12h-2V0H8.667zm2 12H1.333V4.667h9.333L10.667 12z"
      fill="#7A8183"
      fillRule="nonzero"
    />
  </Svg>
);

export default SvgCalendar;
