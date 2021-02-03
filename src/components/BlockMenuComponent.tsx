import { BlockComponentProps } from "./BlockMenu";
import styled from "styled-components";
import Input from "./Input";
import React, { InputHTMLAttributes, useCallback } from "react";
import { toast } from "react-hot-toast";
import { Attrs } from "../lib/Extension";
import { EditorView } from "prosemirror-view";

export function blockMenuInput(
  matcher: (value: string) => Attrs | null,
  inputAttrs?: InputHTMLAttributes<HTMLInputElement>
) {
  const BlockMenuInput: React.FC<BlockComponentProps> = ({
    item,
    insertBlock,
    t,
    view,
    close
  }) => {
    const getAttrs = useCallback(
      (attrs?: Attrs | ((view: EditorView) => Attrs) | undefined) => {
        if (attrs === undefined) {
          return {};
        } else if (typeof attrs === "function") {
          return attrs(view);
        } else {
          return attrs;
        }
      },
      [view]
    );

    const handleInputKeydown = useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
          event.preventDefault();
          event.stopPropagation();

          const value = event.currentTarget.value;
          const matches = matcher(value);

          if (!matches) {
            toast.error(t("抱歉，该链接不适用于此嵌入类型") as string);
            return;
          }

          insertBlock({
            ...item,
            attrs: {
              ...getAttrs(item.attrs),
              ...matches
            }
          });
        }

        if (event.key === "Escape") {
          close();
        }
      },
      [insertBlock, item]
    );

    const handleInputPaste = useCallback(
      (event: React.ClipboardEvent<HTMLInputElement>) => {
        const value = event.clipboardData.getData("text/plain");
        const matches = matcher(value);

        if (matches) {
          event.preventDefault();
          event.stopPropagation();

          insertBlock({
            ...item,
            attrs: {
              ...getAttrs(item.attrs),
              ...matches
            }
          });
        }
      },
      [insertBlock, item]
    );

    return (
      <InputValue
        {...inputAttrs}
        onKeyDown={handleInputKeydown}
        onPaste={handleInputPaste}
        autoFocus
      />
    );
  };

  return BlockMenuInput;
}

const InputValue = styled(Input)`
  width: 100%;
  color: ${props => props.theme.textLight};
`;
