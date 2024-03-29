import React, { ReactNode } from "react";
import styled from "styled-components";

type JustifyValues =
  | "center"
  | "space-around"
  | "space-between"
  | "flex-start"
  | "flex-end";

type AlignValues =
  | "stretch"
  | "center"
  | "baseline"
  | "flex-start"
  | "flex-end";

type Props = {
  style?: Record<string, string>;
  column?: boolean;
  align?: AlignValues;
  justify?: JustifyValues;
  auto?: boolean;
  className?: string;
  children?: ReactNode;
};

const Flex = styled.div<Props>`
  display: flex;
  flex: ${({ auto }: Props) => (auto ? "1 1 auto" : "initial")};
  flex-direction: ${({ column }: Props) => (column ? "column" : "row")};
  align-items: ${({ align }: Props) => align};
  justify-content: ${({ justify }: Props) => justify};
`;

export default Flex;
