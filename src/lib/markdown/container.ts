import MarkdownIt from "markdown-it";
import StateBlock from "markdown-it/lib/rules_block/state_block";
import Token from "markdown-it/lib/token";
import { unescapeAll } from "markdown-it/lib/common/utils";
import StateInline from "markdown-it/lib/rules_inline/state_inline";

function pushAttr(
  attrs: Record<string, string | string[]>,
  key: string,
  value: string
) {
  const attr = attrs[key];
  if (typeof attr === "undefined") {
    attrs[key] = value;
  } else if (typeof attr === "string") {
    attrs[key] = [attr, value];
  } else {
    attr.push(value);
  }
}

function putAttrs(
  token: Token,
  attrs: Record<string, string | string[]> | undefined,
  dests: ["link" | "string", string][] | undefined
) {
  attrs = attrs || {};
  if (dests !== undefined) {
    for (const dest of dests) {
      if (dest[0] === "link") {
        pushAttr(attrs, "$dest_link", dest[1]);
      } else {
        pushAttr(attrs, "$dest_string", dest[1]);
      }
    }
  }
  for (const key in attrs) {
    const value = attrs[key];
    if (typeof value === "string") {
      token.attrJoin(key, value);
    } else {
      for (const item of value) {
        token.attrJoin(key, item);
      }
    }
  }
}

export function blockPlugin({
  md,
  name,
  tag = "div",
  parseInline = true,
  trim = false
}: {
  md: MarkdownIt;
  name: string;
  tag?: string;
  parseInline?: boolean;
  trim?: boolean;
}) {
  // @ts-ignore
  md.blockDirectives[name] = (
    state: StateBlock,
    content: string | undefined,
    contentTitle: string,
    inlineContent: string | undefined,
    dests: ["link" | "string", string][] | undefined,
    attrs: Record<string, string | string[]> | undefined,
    contentStartLine: number,
    contentEndLine: number,
    contentTitleStart: number,
    contentTitleEnd: number,
    inlineContentStart: number,
    inlineContentEnd: number,
    directiveStartLine: number,
    directiveEndLine: number
  ) => {
    let inlineMode = false;
    if (content === undefined) {
      inlineMode = true;
      if (inlineContent === undefined) {
        content = contentTitle;
      } else {
        content = inlineContent;
      }
    }
    if (trim) {
      content = content.trim();
      contentTitle = contentTitle.trim();
    }
    let token = state.push(name + "_open", tag, 1);
    token.map = [directiveStartLine, directiveEndLine];
    token.info = contentTitle;
    putAttrs(token, attrs, dests);
    if (parseInline) {
      if (inlineMode) {
        token = state.push("inline", "", 0);
        token.content = content;
        token.map = [directiveStartLine, directiveStartLine + 1];
        token.children = [];
      } else {
        const oldMax = state.lineMax;
        state.line = contentStartLine;
        state.lineMax = contentEndLine;

        state.md.block.tokenize(state, contentStartLine, contentEndLine);

        state.lineMax = oldMax;
      }
    } else {
      token = state.push("text", "", 0);
      token.content = unescapeAll(content);
    }
    token = state.push(name + "_close", tag, -1);
  };
}

export function inlinePlugin({
  md,
  name,
  tag = "div",
  parseInline = true,
  trim = false
}: {
  md: MarkdownIt;
  name: string;
  tag?: string;
  parseInline?: boolean;
  trim?: boolean;
}) {
  // @ts-ignore
  md.inlineDirectives[name] = (
    state: StateInline,
    content: string,
    dests: ["link" | "string", string][] | undefined,
    attrs: Record<string, string | string[]> | undefined,
    contentStart: number,
    contentEnd: number,
    directiveStart: number,
    directiveEnd: number
  ) => {
    content = content || "";
    if (trim) {
      content = content.trim();
    }
    let token = state.push(name + "_open", tag, 1);
    token.map = [directiveStart, directiveEnd];
    putAttrs(token, attrs, dests);
    if (parseInline) {
      const oldMax = state.posMax;
      state.pos = contentStart;
      state.posMax = contentEnd;
      state.md.inline.tokenize(state);
      state.posMax = oldMax;
    } else {
      token = state.push("text", "", 0);
      token.content = unescapeAll(content);
    }
    token = state.push(name + "_close", tag, -1);
  };
}
