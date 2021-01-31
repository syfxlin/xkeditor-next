import * as React from "react";
import { InputHTMLAttributes } from "react";
import { EditorState } from "prosemirror-state";
import { ApplyCommand, Attrs } from "../lib/Extension";
import { UploadResponse } from "../commands/uploadFiles";

export type MenuItem = {
  icon?: typeof React.Component | React.FC<any>;
  name?: string;
  title?: string;
  shortcut?: string;
  keywords?: string;
  tooltip?: string;
  attrs?: Attrs;
  visible?: boolean;
  active?: (state: EditorState) => boolean;
  // 如果定义了 Command，那么就使用这个 Command，否则就采用扩展里定义的 Command，如果有多个则选择 create 前缀的 Command
  command?: ApplyCommand;
  // 是否开启输入框，输入校验
  input?: InputHTMLAttributes<HTMLInputElement> & {
    matcher: (value: string) => Attrs | null;
  };
  upload?: {
    getAttrs: (res: UploadResponse) => Attrs;
    placeholder?: (root: HTMLElement, meta: any) => void;
    accept?: string;
    capture?: string;
    multiple?: boolean;
  };
};

export type EmbedDescriptor = MenuItem & {
  component: typeof React.Component | React.FC<any>;
};
