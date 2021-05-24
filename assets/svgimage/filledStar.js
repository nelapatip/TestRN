import React from "react";
import Svg, { Path } from "react-native-svg";

const SvgFilledStar = props => (
    <Svg width={26} height={26}{...props}>
        <Path
            d="M12.999 20.895L21.032 26 18.9 16.38 26 9.907l-9.346-.835L13 0 9.346 9.073 0 9.907l7.1 6.473L4.965 26z"
            fill={props.fill ? props.fill : "#00A7E0"}
            fillRule="nonzero"
        />
    </Svg>
);

export default SvgFilledStar;