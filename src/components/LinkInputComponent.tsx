import { ToolbarComponentProps } from "./SelectionToolbar";
import React, { ChangeEvent, useState } from "react";
import { useTheme } from "styled-components";
import Flex from "./Flex";
import Input from "./Input";
import ToolbarButton from "./ToolbarButton";
import Tooltip from "./Tooltip";
import { useTranslation } from "react-i18next";
import getMarkRange from "../queries/getMarkRange";
import { Delete, Share } from "@icon-park/react";
import { Theme } from "../theme";

export default function linkInputComponent(
  onClickLink: (href: string, event: MouseEvent) => void
) {
  const LinkInputComponent: React.FC<ToolbarComponentProps> = ({
    view,
    addMark,
    removeMark
  }) => {
    const markType = view.state.schema.marks.link;
    const range = getMarkRange(view.state.selection.$from, markType);
    if (!range) {
      return null;
    }
    const { mark } = range;
    const theme = useTheme() as Theme;
    const { t } = useTranslation();
    const [value, setValue] = useState(mark ? mark.attrs.href : "");

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
    };
    const handleOpenLink = (e: React.MouseEvent<HTMLElement>) => {
      if (mark && mark.attrs.href) {
        e.preventDefault();
        onClickLink(mark.attrs.href, e.nativeEvent);
      }
    };
    const handleRemoveLink = (): void => {
      removeMark(mark, range);
    };
    const handleKeyDown = (event: React.KeyboardEvent): void => {
      switch (event.key) {
        case "Enter": {
          event.preventDefault();
          addMark(markType, { href: value }, range);
          return;
        }
        case "Escape": {
          event.preventDefault();
          handleRemoveLink();
          return;
        }
      }
    };

    return (
      <Flex>
        <Input
          value={value}
          placeholder={t("搜索或粘贴链接...")}
          onKeyDown={handleKeyDown}
          onChange={handleChange}
          autoFocus={mark.attrs.href === ""}
        />
        <ToolbarButton onClick={handleOpenLink} disabled={!value}>
          <Tooltip tooltip={t("打开链接")}>
            <Share theme="outline" size="100%" fill={theme.reverse.text[2]} />
          </Tooltip>
        </ToolbarButton>
        <ToolbarButton onClick={handleRemoveLink}>
          <Tooltip tooltip={t("删除链接")}>
            <Delete theme="outline" size="100%" fill={theme.reverse.text[2]} />
          </Tooltip>
        </ToolbarButton>
      </Flex>
    );
  };
  return LinkInputComponent;
}
