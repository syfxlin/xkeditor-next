function create_rule(md) {
  var arrayReplaceAt = md.utils.arrayReplaceAt;

  function splitTextToken(text, level, Token) {
    var token,
      last_pos = 0,
      nodes = [];

    text.replace(/:\w+:/g, function(match, offset) {
      var emoji_name = match.slice(1, -1);

      // Add new tokens to pending list
      if (offset > last_pos) {
        token = new Token("text", "", 0);
        token.content = text.slice(last_pos, offset);
        nodes.push(token);
      }

      token = new Token("emoji", "", 0);
      token.markup = emoji_name;
      token.content = emoji_name;
      nodes.push(token);

      last_pos = offset + match.length;
    });

    if (last_pos < text.length) {
      token = new Token("text", "", 0);
      token.content = text.slice(last_pos);
      nodes.push(token);
    }

    return nodes;
  }

  return function emoji_replace(state) {
    var i,
      j,
      l,
      tokens,
      token,
      blockTokens = state.tokens,
      autolinkLevel = 0;

    for (j = 0, l = blockTokens.length; j < l; j++) {
      if (blockTokens[j].type !== "inline") {
        continue;
      }
      tokens = blockTokens[j].children;

      // We scan from the end, to keep position when new tags added.
      // Use reversed logic in links start/end match
      for (i = tokens.length - 1; i >= 0; i--) {
        token = tokens[i];

        if (token.type === "link_open" || token.type === "link_close") {
          if (token.info === "auto") {
            autolinkLevel -= token.nesting;
          }
        }

        if (
          token.type === "text" &&
          autolinkLevel === 0 &&
          /:\w+:/.test(token.content)
        ) {
          // replace current node
          blockTokens[j].children = tokens = arrayReplaceAt(
            tokens,
            i,
            splitTextToken(token.content, token.level, state.Token)
          );
        }
      }
    }
  };
}

export default function emojiPlugin(md) {
  md.core.ruler.push("emoji", create_rule(md));
}
