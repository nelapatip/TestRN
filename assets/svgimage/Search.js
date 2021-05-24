import React from "react";
import Svg, { Path } from "react-native-svg";

const SvgSearch = props => (
  <Svg width={16} height={16} {...props}>
    <Path
      d="M16 14.937l-5.625-5.625a5.786 5.786 0 1 0-1.063 1.063L14.937 16 16 14.937zM5.801 10.069a4.268 4.268 0 1 1 0-8.536 4.268 4.268 0 0 1 0 8.536z"
      fill="#00A7E0"
      fillRule="nonzero"
    />
  </Svg>
);

export default SvgSearch;
