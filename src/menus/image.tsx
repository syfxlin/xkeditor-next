import {
  AlignImageCenterIcon,
  AlignImageLeftIcon,
  AlignImageRightIcon,
  TrashIcon
} from "outline-icons";
import isNodeActive from "../queries/isNodeActive";
import { EditorState } from "prosemirror-state";
import { t } from "../i18n";

export default function imageMenuItems(state: EditorState): any[] {
  const { schema } = state;
  const isLeftAligned = isNodeActive(schema.nodes.image, {
    layoutClass: "left-50"
  });
  const isRightAligned = isNodeActive(schema.nodes.image, {
    layoutClass: "right-50"
  });

  return [
    {
      name: "alignLeft",
      tooltip: t("左对齐"),
      icon: AlignImageLeftIcon,
      visible: true,
      active: isLeftAligned
    },
    {
      name: "alignCenter",
      tooltip: t("居中对齐"),
      icon: AlignImageCenterIcon,
      visible: true,
      active: (state: any) =>
        isNodeActive(schema.nodes.image)(state) &&
        !isLeftAligned(state) &&
        !isRightAligned(state)
    },
    {
      name: "alignRight",
      tooltip: t("右对齐"),
      icon: AlignImageRightIcon,
      visible: true,
      active: isRightAligned
    },
    {
      name: "separator",
      visible: true
    },
    {
      name: "deleteImage",
      tooltip: t("删除图片"),
      icon: TrashIcon,
      visible: true,
      active: () => false
    }
  ];
}
