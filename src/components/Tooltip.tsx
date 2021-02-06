import React from "react";
import Tippy from "@tippyjs/react";
import styled from "styled-components";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/shift-away.css";

type Props = {
  tooltip: React.ReactNode;
  shortcut?: React.ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
  delay?: number;
};

const Tooltip: React.FC<Props> = ({
  shortcut,
  tooltip,
  delay = 150,
  children,
  placement = "top"
}) => {
  let content = tooltip;
  if (!tooltip) {
    return <span>{children}</span>;
  }
  if (shortcut) {
    content = (
      <>
        {tooltip} &middot; <Shortcut>{shortcut}</Shortcut>
      </>
    );
  }
  return (
    <StyledTippy
      offset={[0, 20]}
      arrow
      placement={placement}
      animation="shift-away"
      content={content}
      delay={delay}
      duration={[200, 150]}
      inertia
    >
      <Span>{children}</Span>
    </StyledTippy>
  );
};

const Span = styled.span`
  display: inline-block;
  height: 100%;
  width: 100%;
  padding: 2px;

  .i-icon {
    width: 100%;
    height: 100%;
  }
`;

const Shortcut = styled.kbd`
  position: relative;
  top: -2px;
  display: inline-block;
  padding: 2px 4px;
  font: 10px ${props => props.theme.fontFamily};
  line-height: 10px;
  color: ${props => props.theme.text[2]};
  vertical-align: middle;
  background-color: ${props => props.theme.background[2]};
  border-radius: 3px;
`;

const StyledTippy = styled(Tippy)`
  .tippy-box {
    color: ${props => props.theme.reverse.text[2]};
    box-shadow: 0 0 20px 4px rgba(154, 161, 177, 0.15),
      0 4px 80px -8px rgba(36, 40, 47, 0.25),
      0 4px 4px -2px rgba(91, 94, 105, 0.15);
    background-color: ${props => props.theme.reverse.background[2]};
  }

  .tippy-box[data-placement^="top"] > .tippy-arrow:before {
    border-top-color: ${props => props.theme.reverse.background[2]};
  }

  .tippy-box[data-placement^="bottom"] > .tippy-arrow:before {
    border-bottom-color: ${props => props.theme.reverse.background[2]};
  }

  .tippy-box[data-placement^="left"] > .tippy-arrow:before {
    border-left-color: ${props => props.theme.reverse.background[2]};
  }

  .tippy-box[data-placement^="right"] > .tippy-arrow:before {
    border-right-color: ${props => props.theme.reverse.background[2]};
  }

  .tippy-box > .tippy-backdrop {
    background-color: ${props => props.theme.reverse.background[2]};
  }

  .tippy-box > .tippy-svg-arrow {
    fill: ${props => props.theme.reverse.background[2]};
  }
`;

export default Tooltip;
