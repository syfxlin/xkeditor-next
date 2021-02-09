import React, { useState } from "react";
import { ColorChangeHandler, SketchPicker } from "react-color";
import styled from "styled-components";

type Color =
  | string
  | {
      r: number;
      g: number;
      b: number;
      a: number;
    };

type Props = {
  color: Color;
  onChange: ColorChangeHandler;
};

const ColorPicker: React.FC<Props> = ({ color, onChange }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <Swatch onClick={() => setShow(!show)}>
        <ColorView value={color} />
      </Swatch>
      {show ? (
        <Popover>
          <SketchPicker color={color} onChange={onChange} />
        </Popover>
      ) : null}
    </div>
  );
};

const Swatch = styled.div`
  padding: 5px;
  background: ${props => props.theme.reverse.background[0]};
  border-radius: 1px;
  display: inline-block;
  cursor: pointer;
`;

const ColorView = styled.div<{ value: Color }>`
  width: 36px;
  height: 14px;
  border-radius: 2px;
  background: ${({ value }) =>
    typeof value === "string"
      ? value
      : `rgba(${value.r}, ${value.g}, ${value.b}, ${value.a})`};
`;

const Popover = styled.div`
  position: absolute;
  z-index: ${props => props.theme.zIndex + 101};
`;

export default ColorPicker;
