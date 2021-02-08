import React, { useCallback } from "react";
import { NodeSelection, Plugin, TextSelection } from "prosemirror-state";
import { InputRule } from "prosemirror-inputrules";
import { setTextSelection } from "prosemirror-utils";
import styled from "styled-components";
// @ts-ignore
import ImageZoom from "react-medium-image-zoom";
import getDataTransferFiles from "../lib/getDataTransferFiles";
import { Node as ProseMirrorNode, NodeSpec } from "prosemirror-model";
import ReactNode from "./ReactNode";
import { ComponentProps } from "../lib/ComponentView";
import { NodeArgs } from "./Node";
import { Command, MenuItems, ToolbarItems } from "../lib/Extension";
import Token from "markdown-it/lib/token";
import { MarkdownSerializerState } from "../lib/markdown/serializer";
import uploadFiles, {
  UploadFilesOptions,
  UploadResponse
} from "../commands/uploadFiles";
import { t } from "../i18n";
import isNodeActive from "../queries/isNodeActive";
import {
  AlignHorizontally,
  AlignLeft,
  AlignRight,
  Delete,
  Pic,
  Share
} from "@icon-park/react";

/**
 * Matches following attributes in Markdown-typed image: [, alt, src, class]
 *
 * Example:
 * ![Lorem](image.jpg) -> [, "Lorem", "image.jpg"]
 * ![](image.jpg "class") -> [, "", "image.jpg", "small"]
 * ![Lorem](image.jpg "class") -> [, "Lorem", "image.jpg", "small"]
 */
const IMAGE_INPUT_REGEX = /!\[(?<alt>.*?)]\((?<filename>.*?)(?=[")])"?(?<layoutclass>[^"]+)?"?\)/;

export const imagePlaceholder = (root: HTMLElement, meta: any) => {
  root.className = "image placeholder";
  for (const file of meta.files) {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    root.appendChild(img);
  }
};

const uploadPlugin = (options: Partial<UploadFilesOptions>) =>
  new Plugin({
    props: {
      handleDOMEvents: {
        paste(view, event: ClipboardEvent): boolean {
          if (
            (view.props.editable && !view.props.editable(view.state)) ||
            !options.upload
          ) {
            return false;
          }

          if (!event.clipboardData) return false;

          // check if we actually pasted any files
          const files = Array.prototype.slice
            .call(event.clipboardData.items)
            .map(dt => dt.getAsFile())
            .filter(file => file);

          if (files.length === 0) return false;

          const { tr } = view.state;
          if (!tr.selection.empty) {
            tr.deleteSelection();
          }
          const pos = tr.selection.from;

          uploadFiles({
            ...options,
            view,
            pos,
            files,
            name: "image",
            getAttrs: res => ({ src: res.data[0].url }),
            placeholder: imagePlaceholder,
            event
          });
          return true;
        },
        drop(view, event: DragEvent): boolean {
          if (
            (view.props.editable && !view.props.editable(view.state)) ||
            !options.upload
          ) {
            return false;
          }

          // filter to only include image files
          const files = getDataTransferFiles(event).filter(file =>
            /image/i.test(file.type)
          );
          if (files.length === 0) {
            return false;
          }

          // grab the position in the document for the cursor
          const result = view.posAtCoords({
            left: event.clientX,
            top: event.clientY
          });

          if (result) {
            uploadFiles({
              ...options,
              view,
              pos: result.pos,
              files,
              name: "image",
              getAttrs: res => ({ src: res.data[0].url }),
              placeholder: imagePlaceholder,
              event
            });
            return true;
          }

          return false;
        }
      }
    }
  });

const IMAGE_CLASSES = ["right-50", "left-50"];
const getLayoutAndTitle = (tokenTitle: string | null) => {
  if (!tokenTitle) return {};
  if (IMAGE_CLASSES.includes(tokenTitle)) {
    return {
      layoutClass: tokenTitle
    };
  } else {
    return {
      title: tokenTitle
    };
  }
};

type ImageOptions = {
  upload: (files: File[]) => Promise<UploadResponse>;
  onClickLink?: (href: string, event?: MouseEvent) => void;
};

type ImageAttrs = {
  src: null | string;
  alt: null | string;
  layoutClass: null | string;
  title: null | string;
};

export default class Image extends ReactNode<ImageOptions, ImageAttrs> {
  get name() {
    return "image";
  }

  get schema(): NodeSpec {
    return {
      inline: true,
      attrs: {
        src: {},
        alt: {
          default: null
        },
        layoutClass: {
          default: null
        },
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
          tag: "img",
          getAttrs: node => {
            const img = node as HTMLElement;
            return {
              src: img.getAttribute("src"),
              alt: img.getAttribute("alt"),
              title: img.getAttribute("title")
            };
          }
        },
        {
          tag: "div[class~=image]",
          getAttrs: node => {
            const dom = node as HTMLElement;
            const img = dom.getElementsByTagName("img")[0];
            const className = dom.className;
            const layoutClassMatched =
              className && className.match(/image-(.*)$/);
            const layoutClass = layoutClassMatched
              ? layoutClassMatched[1]
              : null;
            return {
              src: img.getAttribute("src"),
              alt: img.getAttribute("alt"),
              title: img.getAttribute("title"),
              layoutClass: layoutClass
            };
          }
        }
      ],
      toDOM: node => {
        const className = node.attrs.layoutClass
          ? `image image-${node.attrs.layoutClass}`
          : "image";
        return [
          "div",
          {
            class: className
          },
          ["img", { ...node.attrs, contentEditable: "false" }],
          ["p", { class: "caption" }, 0]
        ];
      }
    };
  }

  component(): React.FC<ComponentProps> {
    return ({ theme, isSelected, node, getPos }) => {
      const { alt, src, title, layoutClass } = node.attrs;
      const className = layoutClass ? `image image-${layoutClass}` : "image";

      const handleSelect = useCallback(
        (event: any) => {
          event.preventDefault();

          const { view } = this.editor;
          const $pos = view.state.doc.resolve(getPos());
          const transaction = view.state.tr.setSelection(
            new NodeSelection($pos)
          );
          view.dispatch(transaction);
        },
        [getPos]
      );
      const handleKeyDown = useCallback(
        (event: any) => {
          // Pressing Enter in the caption field should move the cursor/selection
          // below the image
          if (event.key === "Enter") {
            event.preventDefault();

            const { view } = this.editor;
            const pos = getPos() + node.nodeSize;
            view.focus();
            view.dispatch(setTextSelection(pos)(view.state.tr));
            return;
          }

          // Pressing Backspace in an an empty caption field should remove the entire
          // image, leaving an empty paragraph
          if (event.key === "Backspace" && event.target.textContext === "") {
            const { view } = this.editor;
            const $pos = view.state.doc.resolve(getPos());
            const tr = view.state.tr.setSelection(new NodeSelection($pos));
            view.dispatch(tr.deleteSelection());
            view.focus();
            return;
          }
        },
        [node, getPos]
      );
      const handleBlur = useCallback(
        (event: any) => {
          const alt = event.target.innerText;
          const { src, title, layoutClass } = node.attrs;

          if (alt === node.attrs.alt) return;

          const { view } = this.editor;
          const { tr } = view.state;

          // update meta on object
          const pos = getPos();
          const transaction = tr.setNodeMarkup(pos, undefined, {
            src,
            alt,
            title,
            layoutClass
          });
          view.dispatch(transaction);
        },
        [node, getPos]
      );

      return (
        <div contentEditable={false} className={className}>
          <ImageWrapper
            className={isSelected ? "ProseMirror-selectednode" : ""}
            onClick={handleSelect}
          >
            <ImageZoom
              image={{
                src,
                alt,
                title
              }}
              defaultStyles={{
                overlay: {
                  backgroundColor: theme.background[2]
                }
              }}
              shouldRespectMaxDimension
            />
          </ImageWrapper>
          <Caption
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="caption"
            tabIndex={-1}
            contentEditable
            suppressContentEditableWarning
          >
            {alt}
          </Caption>
        </div>
      );
    };
  }

  toMarkdown(state: MarkdownSerializerState, node: ProseMirrorNode) {
    let markdown =
      " ![" +
      state.esc((node.attrs.alt || "").replace("\n", "") || "") +
      "](" +
      state.esc(node.attrs.src);
    if (node.attrs.layoutClass) {
      markdown += ' "' + state.esc(node.attrs.layoutClass) + '"';
    } else if (node.attrs.title) {
      markdown += ' "' + state.esc(node.attrs.title) + '"';
    }
    markdown += ")";
    state.write(markdown);
  }

  parseMarkdown() {
    return {
      node: this.name,
      getAttrs: (token: Token) => {
        return {
          src: token.attrGet("src"),
          alt:
            (token.children &&
              token.children[0] &&
              token.children[0].content) ||
            null,
          ...getLayoutAndTitle(token.attrGet("title"))
        };
      }
    };
  }

  commands({ type }: NodeArgs): Record<string, Command> {
    return {
      openOriginal: () => state => {
        this.options.onClickLink?.(
          (state.selection as NodeSelection).node.attrs.src
        );
      },
      deleteImage: () => (state, dispatch) => {
        dispatch?.(state.tr.deleteSelection());
        return true;
      },
      alignRight: () => (state, dispatch) => {
        const attrs = {
          ...(state.selection as NodeSelection).node.attrs,
          title: null,
          layoutClass: "right-50"
        };
        const { selection } = state;
        dispatch?.(
          state.tr.setNodeMarkup(selection.$from.pos, undefined, attrs)
        );
        return true;
      },
      alignLeft: () => (state, dispatch) => {
        const attrs = {
          ...(state.selection as NodeSelection).node.attrs,
          title: null,
          layoutClass: "left-50"
        };
        const { selection } = state;
        dispatch?.(
          state.tr.setNodeMarkup(selection.$from.pos, undefined, attrs)
        );
        return true;
      },
      alignCenter: () => (state, dispatch) => {
        const attrs = {
          ...(state.selection as NodeSelection).node.attrs,
          layoutClass: null
        };
        const { selection } = state;
        dispatch?.(
          state.tr.setNodeMarkup(selection.$from.pos, undefined, attrs)
        );
        return true;
      },
      createImage: attrs => (state, dispatch) => {
        const selection = state.selection as TextSelection;
        const position = selection.$cursor
          ? selection.$cursor.pos
          : selection.$to.pos;
        const node = type.create(attrs);
        const transaction = state.tr.insert(position, node);
        dispatch?.(transaction);
        return true;
      }
    };
  }

  inputRules({ type }: NodeArgs) {
    return [
      new InputRule(IMAGE_INPUT_REGEX, (state, match, start, end) => {
        const [okay, alt, src, matchedTitle] = match;
        const { tr } = state;
        if (okay) {
          tr.replaceWith(
            start - 1,
            end,
            type.create({
              src,
              alt,
              ...getLayoutAndTitle(matchedTitle)
            })
          );
        }

        return tr;
      })
    ];
  }

  get plugins() {
    return [uploadPlugin(this.options)];
  }

  menuItems(): MenuItems {
    return {
      3: [
        {
          name: "image",
          title: t("图片"),
          icon: Pic,
          keywords: "picture photo image",
          upload: {
            getAttrs: res => ({ src: res.data[0].url }),
            placeholder: imagePlaceholder,
            accept: "image/*"
          }
        }
      ]
    };
  }

  toolbarItems({ type }: NodeArgs): ToolbarItems {
    const isLeftAligned = isNodeActive(type, {
      layoutClass: "left-50"
    });
    const isRightAligned = isNodeActive(type, {
      layoutClass: "right-50"
    });
    return {
      modes: [
        {
          name: "image",
          priority: 4,
          active: view => {
            const { selection }: { selection: any } = view.state;
            return selection.node && selection.node.type.name === "image";
          },
          items: [
            {
              name: "openOriginal",
              title: t("打开原始图片"),
              icon: Share
            },
            {
              name: "alignLeft",
              title: t("左对齐"),
              icon: AlignLeft,
              active: isLeftAligned
            },
            {
              name: "alignCenter",
              title: t("居中对齐"),
              icon: AlignHorizontally,
              active: state =>
                isNodeActive(type)(state) &&
                !isLeftAligned(state) &&
                !isRightAligned(state)
            },
            {
              name: "alignRight",
              title: t("右对齐"),
              icon: AlignRight,
              active: isRightAligned
            },
            {
              name: "separator"
            },
            {
              name: "deleteImage",
              title: t("删除图片"),
              icon: Delete,
              active: () => false
            }
          ]
        }
      ]
    };
  }
}

const ImageWrapper = styled.span`
  line-height: 0;
  display: inline-block;
`;

const Caption = styled.p`
  border: 0;
  display: block;
  font-size: 13px;
  font-style: italic;
  color: ${props => props.theme.text[1]};
  padding: 2px 0;
  line-height: 16px;
  text-align: center;
  min-height: 1em;
  outline: none;
  background: none;
  resize: none;
  user-select: text;
  cursor: text;

  &:empty:before {
    color: ${props => props.theme.text[1]};
    content: ${() => `"${t("图片描述")}"`};
    pointer-events: none;
  }
`;
