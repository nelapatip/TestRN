import React from "react";
import Svg, { Path } from "react-native-svg";

const SvgStar = props => (
  <Svg width={120} height={120} {...props}>
    <Path
      d="M120 45.725L76.86 41.81 60.002 0 43.14 41.875 0 45.725 32.775 75.6 22.92 120l37.079-23.56L97.08 120l-9.78-44.4L120 45.725zM60.002 84.63L37.44 98.97l5.999-27.035-19.922-18.19 26.282-2.4L60.002 25.89l10.26 25.5 26.282 2.4L76.618 72l6 27.03-22.616-14.4z"
      fill="#00A7E0"
      fillRule="nonzero"
    />
  </Svg>
);

export default SvgStar;
