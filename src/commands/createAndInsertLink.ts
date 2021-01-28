import { EditorView } from "prosemirror-view";
import { Node } from "prosemirror-model";
import { t } from "../i18n";
import { toast } from "react-hot-toast";

const findPlaceholderLink = (
  doc: Node,
  href: string
): false | { node: Node; pos: number } => {
  let result: false | { node: Node; pos: number } = false;

  function findLinks(node: Node, pos = 0) {
    // get text nodes
    if (node.type.name === "text") {
      // get marks for text nodes
      node.marks.forEach(mark => {
        // any of the marks links?
        if (mark.type.name === "link") {
          // any of the links to other docs?
          if (mark.attrs.href === href) {
            result = { node, pos };
            if (result) return false;
          }
        }
      });
    }

    if (!node.content.size) {
      return;
    }

    node.descendants(findLinks);
  }

  findLinks(doc);
  return result;
};

const createAndInsertLink = async (
  view: EditorView,
  title: string,
  href: string,
  options: {
    onCreateLink: (title: string) => Promise<string>;
  }
): Promise<void> => {
  const { dispatch, state } = view;
  const { onCreateLink } = options;

  try {
    const url = await onCreateLink(title);
    const result = findPlaceholderLink(view.state.doc, href);

    if (!result) return;

    dispatch(
      view.state.tr
        .removeMark(
          result.pos,
          result.pos + result.node.nodeSize,
          state.schema.marks.link
        )
        .addMark(
          result.pos,
          result.pos + result.node.nodeSize,
          state.schema.marks.link.create({ href: url })
        )
    );
  } catch (err) {
    const result = findPlaceholderLink(view.state.doc, href);
    if (!result) return;

    dispatch(
      view.state.tr.removeMark(
        result.pos,
        result.pos + result.node.nodeSize,
        state.schema.marks.link
      )
    );

    // let the user know
    toast.error(t("抱歉，创建链接时发生错误") as string);
  }
};

export default createAndInsertLink;
