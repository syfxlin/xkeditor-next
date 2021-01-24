import MarkdownIt from "markdown-it";
import Token from "markdown-it/lib/token";

const CHECKBOX_REGEX = /\[(X|\s|_|-)\]\s(.*)?/i;

function matches(token: Token) {
  return token.content.match(CHECKBOX_REGEX);
}

function isInline(token: Token): boolean {
  return token.type === "inline";
}

function isParagraph(token: Token): boolean {
  return token.type === "paragraph_open";
}

function looksLikeChecklist(tokens: Token[], index: number) {
  return (
    isInline(tokens[index]) &&
    isParagraph(tokens[index - 1]) &&
    matches(tokens[index])
  );
}

export default function markdownItCheckbox(md: MarkdownIt): void {
  // insert a new rule after the "inline" rules are parsed
  md.core.ruler.after("inline", "checkboxes", state => {
    const tokens = state.tokens;

    // work backwards through the tokens and find text that looks like a checkbox
    for (let i = tokens.length - 1; i > 0; i--) {
      const matches = looksLikeChecklist(tokens, i);
      if (matches) {
        const value = matches[1];
        const checked = value.toLowerCase() === "x";

        // convert surrounding list tokens
        if (tokens[i - 3].type === "bullet_list_open") {
          tokens[i - 3].type = "checkbox_list_open";
        }

        if (tokens[i + 3].type === "bullet_list_close") {
          tokens[i + 3].type = "checkbox_list_close";
        }

        // remove [ ] [x] from list item label – must use the content from the
        // child for escaped characters to be unescaped correctly.
        const tokenChildren = tokens[i].children;
        if (tokenChildren) {
          const contentMatches = tokenChildren[0].content.match(CHECKBOX_REGEX);

          if (contentMatches) {
            const label = contentMatches[2];

            tokens[i].content = label;
            tokenChildren[0].content = label;
          }
        }

        // open list item and ensure checked state is transferred
        tokens[i - 2].type = "checkbox_item_open";
        if (checked) {
          tokens[i - 2].attrs = [["checked", "true"]];
        }

        // close the list item
        let j = i;
        while (tokens[j].type !== "list_item_close") {
          j++;
        }
        tokens[j].type = "checkbox_item_close";
      }
    }

    return false;
  });
}
