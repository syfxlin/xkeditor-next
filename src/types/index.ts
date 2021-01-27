import * as React from "react";
import { EditorState } from "prosemirror-state";

export enum ToastType {
  Error = "error",
  Info = "info"
}

export type MenuItem = {
  icon?: typeof React.Component | React.FC<any>;
  name?: string;
  title?: string;
  shortcut?: string;
  keywords?: string;
  tooltip?: string;
  attrs?: Record<string, any>;
  visible?: boolean;
  active?: (state: EditorState) => boolean;
  // 存在 matcher 就认为要开启 input
  matcher?: (value: string) => Record<string, any> | null;
};

export type EmbedDescriptor = MenuItem & {
  component: typeof React.Component | React.FC<any>;
};
