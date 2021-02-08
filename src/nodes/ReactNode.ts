import Node from "./Node";
import { ComponentType } from "react";
import { ComponentProps } from "../lib/ComponentView";
import { Attrs } from "../lib/Extension";

export default abstract class ReactNode<
  O extends Attrs = Attrs,
  A extends Attrs = Attrs
> extends Node<O, A> {
  abstract component(): ComponentType<ComponentProps>;
}
