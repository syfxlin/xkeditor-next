import Node from "./Node";
import { EmptyAttrs } from "../lib/Extension";

export default class Text extends Node<EmptyAttrs, EmptyAttrs> {
  get name() {
    return "text";
  }

  get schema() {
    return {
      group: "inline"
    };
  }
}
