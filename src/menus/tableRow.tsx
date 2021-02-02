import { EditorState } from "prosemirror-state";
import { InsertAboveIcon, InsertBelowIcon, TrashIcon } from "outline-icons";
import { t } from "../i18n";

export default function tableRowMenuItems(
  state: EditorState,
  index: number
): any[] {
  return [
    {
      name: "addRowAfter",
      tooltip: t("在上方插入行"),
      icon: InsertAboveIcon,
      attrs: { index: index - 1 },
      active: () => false,
      visible: index !== 0
    },
    {
      name: "addRowAfter",
      tooltip: t("在下方插入行"),
      icon: InsertBelowIcon,
      attrs: { index },
      active: () => false
    },
    {
      name: "separator"
    },
    {
      name: "deleteRow",
      tooltip: t("删除行"),
      icon: TrashIcon,
      active: () => false
    }
  ];
}
