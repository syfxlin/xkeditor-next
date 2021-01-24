import { wrappingInputRule } from "prosemirror-inputrules";
import toggleList from "../commands/toggleList";
import Node, { NodeArgs } from "./Node";
import { Node as ProsemirrorNode, NodeSpec } from "prosemirror-model";
import { PluginSimple } from "markdown-it";
import checkboxPlugin from "../lib/markdown/checkboxes";
import { MarkdownSerializerState } from "../lib/markdown/serializer";

export default class CheckboxList extends Node {
  get name() {
    return "checkbox_list";
  }

  get schema(): NodeSpec {
    return {
      group: "block",
      content: "checkbox_item+",
      toDOM: () => ["ul", { class: this.name }, 0],
      parseDOM: [
        {
          tag: `[class="${this.name}"]`
        }
      ]
    };
  }

  keys({ type, schema }: NodeArgs) {
    return {
      "Shift-Ctrl-7": toggleList(type, schema.nodes.checkbox_item)
    };
  }

  commands({ type, schema }: NodeArgs) {
    return () => toggleList(type, schema.nodes.checkbox_item);
  }

  inputRules({ type }: NodeArgs) {
    return [wrappingInputRule(/^-?\s*(\[ \])\s$/i, type)];
  }

  toMarkdown(state: MarkdownSerializerState, node: ProsemirrorNode) {
    state.renderList(node, "  ", () => "- ");
  }

  parseMarkdown() {
    return { block: "checkbox_list" };
  }

  markdownPlugin(): PluginSimple {
    return checkboxPlugin;
  }
}
