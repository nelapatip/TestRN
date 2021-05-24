import React from "react";
import Svg, { G, Rect, Path } from "react-native-svg";

const SvgEditAlert = props => (
  <Svg width={22} height={22} {...props}>
    <G transform="translate(1 1.273)" fillRule="nonzero" fill="none">
      <Rect stroke="#616A6D" fill="#FFF" width={20} height={20} rx={4} />
      <Path
        d="M4.989 12.975v2.043h2.043l6.024-6.029-2.042-2.039-6.025 6.025zm10.028-5.943l-2.042-2.043-1.378 1.384 2.042 2.042 1.378-1.383z"
        fill="#616A6D"
      />
    </G>
  </Svg>
);

export default SvgEditAlert;
