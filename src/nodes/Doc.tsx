import Node from "./Node";
import { EmptyAttrs } from "../lib/Extension";

export default class Doc extends Node<EmptyAttrs, EmptyAttrs> {
  get name() {
    return "doc";
  }

  get schema() {
    return {
      content: "block+"
    };
  }
}
