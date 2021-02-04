import React from "react";
import Tippy from "@tippyjs/react";
import styled from "styled-components";

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
`;

const Shortcut = styled.kbd`
  position: relative;
  top: -2px;
  display: inline-block;
  padding: 2px 4px;
  font: 10px "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier,
    monospace;
  line-height: 10px;
  color: ${props => props.theme.toolbarBackground};
  vertical-align: middle;
  background-color: ${props => props.theme.textLight};
  border-radius: 3px;
`;

const StyledTippy = styled(Tippy)``;

export default Tooltip;
