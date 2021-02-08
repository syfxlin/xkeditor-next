import React, { ComponentType, useCallback } from "react";
import scrollIntoView from "smooth-scroll-into-view-if-needed";
import styled, { withTheme } from "styled-components";
import { Theme } from "../theme";

type Props = {
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  theme: Theme;
  icon: ComponentType<any>;
  title: string;
  shortcut?: string;
};

const BlockMenuItem: React.FC<Props> = ({
  selected,
  disabled,
  onClick,
  title,
  shortcut,
  icon
}) => {
  const Icon = icon;

  const ref = useCallback(
    node => {
      if (selected && node) {
        scrollIntoView(node, {
          scrollMode: "if-needed",
          block: "center",
          boundary: parent => {
            // All the parent elements of your target are checked until they
            // reach the #block-menu-container. Prevents body and other parent
            // elements from being scrolled
            return parent.id !== "block-menu-container";
          }
        });
      }
    },
    [selected]
  );

  return (
    <MenuItem
      selected={selected}
      onClick={disabled ? undefined : onClick}
      ref={ref}
    >
      <Icon />
      &nbsp;&nbsp;{title}
      <Shortcut>{shortcut}</Shortcut>
    </MenuItem>
  );
};

const MenuItem = styled.button<{
  selected: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-weight: 500;
  font-size: 14px;
  line-height: 1;
  width: 100%;
  height: 36px;
  cursor: pointer;
  border: none;
  opacity: ${props => (props.disabled ? ".5" : "1")};
  color: ${props =>
    props.selected ? props.theme.selected.text : props.theme.text[2]};
  background: ${props =>
    props.selected ? props.theme.selected.background : "none"};
  padding: 0 16px;
  outline: none;

  &:hover,
  &:active {
    color: ${props => props.theme.text[2]};
    background: ${props =>
      props.selected
        ? props.theme.selected.background
        : props.theme.hover.background};
  }
`;

const Shortcut = styled.span`
  color: ${props => props.theme.text[1]};
  flex-grow: 1;
  text-align: right;
`;

export default withTheme(BlockMenuItem);
