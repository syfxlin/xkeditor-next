import Node from "./Node";
import React from "react";
import { ComponentProps } from "../lib/ComponentView";

export default abstract class ReactNode extends Node {
  abstract component(props: ComponentProps): React.ReactElement;
}
