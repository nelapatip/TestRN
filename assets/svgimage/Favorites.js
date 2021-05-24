import React from "react";
import Svg, { Path } from "react-native-svg";

const SvgFavorites = props => (
  <Svg width={20} height={20} {...props}>
    <Path
      d="M9.99 0a10 10 0 1 0 .026 20A10 10 0 0 0 9.99 0zm4.24 16L10 13.45 5.77 16l1.12-4.81-3.73-3.23 4.92-.42L10 3l1.92 4.53 4.92.42-3.73 3.23L14.23 16z"
      fill="#B7BABD"
      fillRule="nonzero"
    />
  </Svg>
);

export default SvgFavorites;
