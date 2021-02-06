import React from "react";
import { EditorView } from "prosemirror-view";
import { withTheme } from "styled-components";
import ToolbarButton from "./ToolbarButton";
import ToolbarSeparator from "./ToolbarSeparator";
import { Attrs, ToolbarItem } from "../lib/Extension";
import capitalize from "lodash/capitalize";
import Tooltip from "./Tooltip";
import { Theme } from "../theme";

type Props = {
  commands: Record<string, any>;
  view: EditorView;
  theme: Theme;
  items: ToolbarItem[];
};

class Menu extends React.Component<Props> {
  getAttrs = (attrs?: Attrs | ((view: EditorView) => Attrs) | undefined) => {
    if (attrs === undefined) {
      return {};
    } else if (typeof attrs === "function") {
      return attrs(this.props.view);
    } else {
      return attrs;
    }
  };

  handleClick = (item: ToolbarItem) => () => {
    let command = item.command;
    if (!command) {
      command = this.props.commands[item.name as string];
    }
    if (!command) {
      command = this.props.commands[`create${capitalize(item.name)}`];
    }
    command?.(this.getAttrs(item.attrs));
  };

  render() {
    const { view, items } = this.props;
    const { state } = view;
    return (
      <>
        {items.map((item, index) => {
          if (item.name === "separator" && item.visible !== false) {
            return <ToolbarSeparator key={index} />;
          }
          if (item.visible === false || !item.icon) {
            return null;
          }
          const Icon = item.icon;
          const isActive = item.active ? item.active(state) : false;

          return (
            <ToolbarButton
              key={index}
              onClick={this.handleClick(item)}
              active={isActive}
            >
              <Tooltip tooltip={item.title} shortcut={item.shortcut}>
                <Icon fill={this.props.theme.reverse.text[2]} size={"100%"} />
              </Tooltip>
            </ToolbarButton>
          );
        })}
      </>
    );
  }
}

export default withTheme(Menu);
