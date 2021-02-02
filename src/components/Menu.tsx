import * as React from "react";
import { EditorView } from "prosemirror-view";
import { withTheme } from "styled-components";
import ToolbarButton from "./ToolbarButton";
import ToolbarSeparator from "./ToolbarSeparator";
import theme from "../theme";
import { Attrs, ToolbarItem } from "../lib/Extension";
import capitalize from "lodash/capitalize";

type Props = {
  tooltip: typeof React.Component | React.FC<any>;
  commands: Record<string, any>;
  view: EditorView;
  theme: typeof theme;
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
    const Tooltip = this.props.tooltip;

    return (
      <div>
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
              <Tooltip
                tooltip={`${item.title}\n${item.shortcut}`}
                placement="top"
              >
                <Icon color={this.props.theme.toolbarItem} />
              </Tooltip>
            </ToolbarButton>
          );
        })}
      </div>
    );
  }
}

export default withTheme(Menu);
