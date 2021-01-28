import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  InsertLeftIcon,
  InsertRightIcon,
  TrashIcon
} from "outline-icons";
import { EditorState } from "prosemirror-state";
import isNodeActive from "../queries/isNodeActive";
import { MenuItem } from "../types";
import { t } from "../i18n";

export default function tableColMenuItems(
  state: EditorState,
  index: number
): MenuItem[] {
  const { schema } = state;

  return [
    {
      name: "setColumnAttr",
      tooltip: t("左对齐"),
      icon: AlignLeftIcon,
      attrs: { index, alignment: "left" },
      active: isNodeActive(schema.nodes.th, {
        colspan: 1,
        rowspan: 1,
        alignment: "left"
      })
    },
    {
      name: "setColumnAttr",
      tooltip: t("居中对齐"),
      icon: AlignCenterIcon,
      attrs: { index, alignment: "center" },
      active: isNodeActive(schema.nodes.th, {
        colspan: 1,
        rowspan: 1,
        alignment: "center"
      })
    },
    {
      name: "setColumnAttr",
      tooltip: t("右对齐"),
      icon: AlignRightIcon,
      attrs: { index, alignment: "right" },
      active: isNodeActive(schema.nodes.th, {
        colspan: 1,
        rowspan: 1,
        alignment: "right"
      })
    },
    {
      name: "separator"
    },
    {
      name: "addColumnBefore",
      tooltip: t("在左边插入列"),
      icon: InsertLeftIcon,
      active: () => false
    },
    {
      name: "addColumnAfter",
      tooltip: t("在右边插入列"),
      icon: InsertRightIcon,
      active: () => false
    },
    {
      name: "separator"
    },
    {
      name: "deleteColumn",
      tooltip: t("删除列"),
      icon: TrashIcon,
      active: () => false
    }
  ];
}
