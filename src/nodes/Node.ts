import { MarkdownSerializerState } from "../lib/markdown/serializer";
import {
  Node as ProseMirrorNode,
  NodeSpec,
  NodeType,
  Schema
} from "prosemirror-model";
import Extension, { Command, Dispatcher } from "../lib/Extension";
import { InputRule } from "prosemirror-inputrules";
import { PluginSimple, PluginWithOptions, PluginWithParams } from "markdown-it";
import toggleBlockType from "../commands/toggleBlockType";
import { TokenConfig } from "prosemirror-markdown";

export type NodeArgs = { type: NodeType; schema: Schema };

export default abstract class Node extends Extension {
  get type(): string {
    return "node";
  }

  abstract get schema(): NodeSpec;

  get markdownToken(): string {
    return "";
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

  commands({ type, schema }: NodeArgs): Record<string, Command> | Command {
    return () => toggleBlockType(type, schema.nodes.paragraph);
  }

  keys(options: NodeArgs): Record<string, Dispatcher> {
    return super.keys(options);
  }

  inputRules(options: NodeArgs): InputRule[] {
    return super.inputRules(options);
  }
}
