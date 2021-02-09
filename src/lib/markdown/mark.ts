// Adapted from:
// https://github.com/markdown-it/markdown-it-mark/blob/master/index.js

import MarkdownIt from "markdown-it";
import StateInline from "markdown-it/lib/rules_inline/state_inline";

export default function(options: { delim: string; mark: string }) {
  const delimCharCode = options.delim.charCodeAt(0);

  function tokenize(state: StateInline, silent: boolean): boolean {
    let i, token;

    const start = state.pos,
      marker = state.src.charCodeAt(start);

    if (silent) {
      return false;
    }

    if (marker !== delimCharCode) {
      return false;
    }

    const scanned = state.scanDelims(state.pos, true);
    const ch = String.fromCharCode(marker);
    const len = scanned.length;

    if (len < options.delim.length) {
      return false;
    }

    for (i = 0; i < len; i++) {
      token = state.push("text", "", 0);
      token.content = ch;

      if (!scanned.can_open && !scanned.can_close) {
        continue;
      }

      state.delimiters.push({
        marker,
        length: 0, // disable "rule of 3" length checks meant for emphasis
        jump: i,
        token: state.tokens.length - 1,
        end: -1,
        open: scanned.can_open,
        close: scanned.can_close
      });
    }

    state.pos += scanned.length;
    return true;
  }

  function postProcess(
    state: StateInline,
    delimiters: StateInline.Delimiter[]
  ) {
    let i, j, startDelim, endDelim, token;
    const loneMarkers: number[] = [],
      max = delimiters.length;

    for (i = 0; i < max; i++) {
      startDelim = delimiters[i];

      if (startDelim.marker !== delimCharCode) {
        continue;
      }

      if (startDelim.end === -1) {
        continue;
      }

      endDelim = delimiters[startDelim.end];

      token = state.tokens[startDelim.token];
      token.type = `${options.mark}_open`;
      token.tag = "span";
      token.nesting = 1;
      token.markup = options.delim;
      token.content = "";

      token = state.tokens[endDelim.token];
      token.type = `${options.mark}_close`;
      token.tag = "span";
      token.nesting = -1;
      token.markup = options.delim;
      token.content = "";

      if (
        state.tokens[endDelim.token - 1].type === "text" &&
        state.tokens[endDelim.token - 1].content === options.delim[0]
      ) {
        loneMarkers.push(endDelim.token - 1);
      }
    }

    // If a marker sequence has an odd number of characters, it's split
    // like this: `~~~~~` -> `~` + `~~` + `~~`, leaving one marker at the
    // start of the sequence.
    //
    // So, we have to move all those markers after subsequent s_close tags.
    while (loneMarkers.length) {
      i = loneMarkers.pop() as number;
      j = i + 1;

      while (
        j < state.tokens.length &&
        state.tokens[j].type === `${options.mark}_close`
      ) {
        j++;
      }

      j--;

      if (i !== j) {
        token = state.tokens[j];
        state.tokens[j] = state.tokens[i];
        state.tokens[i] = token;
      }
    }
  }

  return function markPlugin(md: MarkdownIt) {
    md.inline.ruler.before("emphasis", options.mark, tokenize);
    // @ts-ignore
    md.inline.ruler2.before("emphasis", options.mark, function(state) {
      let curr;
      const tokensMeta = state.tokens_meta as StateInline.TokenMata[],
        max = (state.tokens_meta || []).length;

      postProcess(state, state.delimiters);

      for (curr = 0; curr < max; curr++) {
        if (tokensMeta[curr] && tokensMeta[curr].delimiters) {
          postProcess(state, tokensMeta[curr].delimiters);
        }
      }
    });
  };
}
