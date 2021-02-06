import Node, { NodeArgs } from "./Node";
import { EmptyAttrs } from "../lib/Extension";
import { Node as ProseMirrorNode, NodeSpec } from "prosemirror-model";
import { InputRule } from "prosemirror-inputrules";
import nodeInputRule from "../lib/nodeInputRule";
import { MarkdownSerializerState } from "../lib/markdown/serializer";
import { TokenConfig } from "prosemirror-markdown";
import { PluginSimple } from "markdown-it";
import { inlinePlugin } from "../lib/markdown/container";

type VideoAttrs = {
  src: string | null;
  title: null | string;
};

const VIDEO_INPUT_REGEX = /:video\[(?<alt>.*?)]\((?<filename>.*?)(?=[")])"?(?<title>[^"]+)?"?\)/;

export default class Video extends Node<EmptyAttrs, VideoAttrs> {
  get name() {
    return "video";
  }

  get schema(): NodeSpec {
    return {
      inline: true,
      attrs: {
        src: {},
        title: {
          default: null
        }
      },
      content: "text*",
      marks: "",
      group: "inline",
      selectable: true,
      draggable: true,
      parseDOM: [
        {
          tag: "video",
          getAttrs: node => {
            const dom = node as HTMLElement;
            return {
              src: dom.getAttribute("src"),
              title: dom.getAttribute("title")
            };
          }
        }
      ],
      toDOM: node => {
        const title = node.attrs.title || node.textContent;
        return ["video", { title, src: node.attrs.src, controls: "true" }];
      }
    };
  }

  inputRules({ type }: NodeArgs): InputRule[] {
    return [
      nodeInputRule(VIDEO_INPUT_REGEX, type, 1, match => ({
        src: match[2],
        title: match[3]
      }))
    ];
  }

  toMarkdown(state: MarkdownSerializerState, node: ProseMirrorNode) {
    state.write(":video[");
    state.write(node.textContent);
    state.write("](");
    state.write(node.attrs.src);
    if (node.attrs.title) {
      state.write(` "${node.attrs.title}"`);
    }
    state.write(")");
  }

  parseMarkdown(): TokenConfig {
    return {
      block: this.name,
      getAttrs: token => ({
        src: token.attrGet("$dest_link"),
        title: token.attrGet("$dest_string")
      })
    };
  }

  markdownPlugin(): PluginSimple {
    return md => {
      inlinePlugin({
        md,
        name: this.name
      });
    };
  }
}
