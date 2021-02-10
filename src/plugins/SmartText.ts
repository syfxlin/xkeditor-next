import { ellipsis, InputRule } from "prosemirror-inputrules";
import Extension from "../lib/Extension";

const rules: [RegExp, string][] = [
  [/【 $/, "["],
  [/】 $/, "]"],
  [/！ /, "!"],
  [/（ $/, "("],
  [/） $/, ")"],
  [/： $/, ":"]
];

export default class SmartText extends Extension {
  get name() {
    return "smart_text";
  }

  inputRules() {
    return [...rules.map(([reg, rep]) => new InputRule(reg, rep)), ellipsis];
  }
}
