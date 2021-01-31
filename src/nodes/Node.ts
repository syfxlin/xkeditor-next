import { MarkdownSerializerState } from "../lib/markdown/serializer";
import {
  Node as ProseMirrorNode,
  NodeSpec,
  NodeType,
  Schema
} from "prosemirror-model";
import Extension, {
  ApplyCommand,
  Attrs,
  Command,
  Dispatcher
} from "../lib/Extension";
import { InputRule } from "prosemirror-inputrules";
import { PluginSimple, PluginWithOptions, PluginWithParams } from "markdown-it";
import toggleBlockType from "../commands/toggleBlockType";
import { TokenConfig } from "prosemirror-markdown";
import * as React from "react";
import { InputHTMLAttributes } from "react";
import { EditorState } from "prosemirror-state";
import { UploadResponse } from "../commands/uploadFiles";

export type NodeArgs = { type: NodeType; schema: Schema };

export type NodeMenuItem = {
  name: string;
  icon?: typeof React.Component | React.FC<any>;
  title?: string;
  shortcut?: string;
  keywords?: string;
  attrs?: Attrs;
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

export type NodeToolbarItem = {
  name: string;
  icon?: typeof React.Component | React.FC<any>;
  title?: string;
  shortcut?: string;
  attrs?: Attrs;
  visible?: boolean;
  active?: (state: EditorState) => boolean;
  // 如果定义了 Command，那么就使用这个 Command，否则就采用扩展里定义的 Command，如果有多个则选择 create 前缀的 Command
  command?: ApplyCommand;
};

export default abstract class Node<
  O extends Attrs = Attrs,
  A extends Attrs = Attrs
> extends Extension<O, A> {
  get type(): string {
    return "node";
  }

  abstract get schema(): NodeSpec;

  get markdownToken(): string {
    return this.name;
  }

  toMarkdown(state: MarkdownSerializerState, node: ProseMirrorNode): void {
    console.error("toMarkdown not implemented", state, node);
  }

  parseMarkdown(): TokenConfig | undefined {
    return undefined;
  }

  markdownPlugin():
    | PluginSimple
    | PluginWithParams
    | PluginWithOptions
    | undefined {
    return undefined;
  }

  commands({
    type,
    schema
  }: NodeArgs): Record<string, Command<A>> | Command<A> {
    return attrs => toggleBlockType(type, schema.nodes.paragraph, attrs);
  }

  keys(options: NodeArgs): Record<string, Dispatcher> {
    return super.keys(options);
  }

  inputRules(options: NodeArgs): InputRule[] {
    return super.inputRules(options);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  menuItems(options: NodeArgs): NodeMenuItem[] {
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toolbarItems(options: NodeArgs): NodeToolbarItem[] {
    return [];
  }
}
