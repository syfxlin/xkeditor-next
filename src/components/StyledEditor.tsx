import styled from "styled-components";

const StyledEditor = styled("div")<{
  readOnly?: boolean;
}>`
  color: ${props => props.theme.text[2]};
  background: ${props => props.theme.background[2]};
  font-family: ${props => props.theme.fontFamily};
  font-weight: ${props => props.theme.fontWeight};
  font-size: 1em;
  line-height: 1.7em;
  width: 100%;

  .ProseMirror {
    position: relative;
    outline: none;
    word-wrap: break-word;
    white-space: pre-wrap;
    -webkit-font-variant-ligatures: none;
    font-variant-ligatures: none;
    font-feature-settings: "liga" 0; /* the above doesn't seem to work in Edge */
  }

  // Select & Selection
  .ProseMirror-hideselection *::selection {
    background: transparent;
  }

  .ProseMirror-hideselection *::-moz-selection {
    background: transparent;
  }

  .ProseMirror-hideselection {
    caret-color: transparent;
  }

  .ProseMirror-selectednode {
    outline: 2px solid
      ${props => (props.readOnly ? "transparent" : props.theme.primary)};
  }

  /* Make sure li selections wrap around markers */

  li.ProseMirror-selectednode {
    outline: none;
  }

  li.ProseMirror-selectednode:after {
    content: "";
    position: absolute;
    left: -32px;
    right: -2px;
    top: -2px;
    bottom: -2px;
    border: 2px solid ${props => props.theme.primary};
    pointer-events: none;
  }

  // ReadOnly
  .ProseMirror[contenteditable="false"] {
    .caption {
      pointer-events: none;
    }

    .caption:empty {
      visibility: hidden;
    }
  }

  // BlockMenuTrigger
  .block-menu-trigger {
    display: ${props => (props.readOnly ? "none" : "inline")};
    height: 1em;
    color: ${props => props.theme.text[1]};
    background: none;
    border-radius: 100%;
    font-size: 30px;
    position: absolute;
    transform: scale(0.9);
    transition: color 150ms cubic-bezier(0.175, 0.885, 0.32, 1.275),
      transform 150ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
    outline: none;
    border: 0;
    line-height: 26px;
    margin-top: -2px;
    margin-left: -28px;

    &:hover,
    &:focus {
      cursor: pointer;
      transform: scale(1);
      color: ${props => props.theme.text[2]};
    }
  }

  .ProseMirror-gapcursor {
    display: none;
    pointer-events: none;
    position: absolute;
  }

  .ProseMirror-gapcursor:after {
    content: "";
    display: block;
    position: absolute;
    top: -2px;
    width: 20px;
    border-top: 1px solid ${props => props.theme.text[2]};
    animation: ProseMirror-cursor-blink 1.1s steps(2, start) infinite;
  }

  @keyframes ProseMirror-cursor-blink {
    to {
      visibility: hidden;
    }
  }

  .ProseMirror-focused .ProseMirror-gapcursor {
    display: block;
  }

  // Heading
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 1em 0 0.5em;
    font-weight: 500;
    cursor: default;

    &:not(.placeholder):before {
      display: ${props => (props.readOnly ? "none" : "inline-block")};
      font-family: ${props => props.theme.fontFamilyMono};
      color: ${props => props.theme.text[1]};
      font-size: 13px;
      line-height: 0;
      margin-left: -24px;
      width: 24px;
    }

    &:hover {
      .heading-anchor {
        opacity: 1;
      }
    }
  }

  .heading-content {
    &:before {
      content: "​";
      display: inline;
    }
  }

  .heading-name {
    color: ${props => props.theme.text[2]};

    &:hover {
      text-decoration: none;
    }
  }

  a:first-child {
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      margin-top: 0;
    }
  }

  h1:not(.placeholder):before {
    content: "H1";
  }

  h2:not(.placeholder):before {
    content: "H2";
  }

  h3:not(.placeholder):before {
    content: "H3";
  }

  h4:not(.placeholder):before {
    content: "H4";
  }

  h5:not(.placeholder):before {
    content: "H5";
  }

  h6:not(.placeholder):before {
    content: "H6";
  }

  .heading-anchor {
    opacity: 0;
    display: ${props => (props.readOnly ? "inline-block" : "none")};
    color: ${props => props.theme.text[1]};
    cursor: pointer;
    background: none;
    border: 0;
    outline: none;
    padding: 2px 12px 2px 4px;
    transition: opacity 100ms ease-in-out;
    font-family: ${props => props.theme.fontFamilyMono};
    font-size: 22px;
    line-height: 0;
    margin: 0 0 0 -24px;
    width: 24px;

    &:focus,
    &:hover {
      color: ${props => props.theme.text[2]};
    }
  }

  // Paragraph
  p {
    margin: 2px 0 0.5em 0;
  }

  // Hr
  hr {
    height: 0;
    border: 0;
    border-top: 2px solid ${props => props.theme.divider};
  }

  // Table
  table {
    width: 100%;
    border-collapse: collapse;
    border-radius: 4px;
    margin-top: 1em;
    box-sizing: border-box;

    * {
      box-sizing: border-box;
    }

    tr {
      position: relative;
      border-bottom: 1px solid ${props => props.theme.table.divider};
    }

    th {
      background: ${props => props.theme.table.header};
    }

    td,
    th {
      position: relative;
      vertical-align: top;
      border: 1px solid ${props => props.theme.table.divider};
      padding: 4px 8px;
      text-align: left;
      min-width: 100px;
    }

    .selectedCell {
      background: ${props =>
        props.readOnly ? "inherit" : props.theme.table.selected};

      /* fixes Firefox background color painting over border:
       * https://bugzilla.mozilla.org/show_bug.cgi?id=688556 */
      background-clip: padding-box;
    }

    .grip-column {
      /* usage of ::after for all of the table grips works around a bug in
       * prosemirror-tables that causes Safari to hang when selecting a cell
       * in an empty table:
       * https://github.com/ProseMirror/prosemirror/issues/947 */

      &::after {
        content: "";
        cursor: pointer;
        position: absolute;
        top: -16px;
        left: 0;
        width: 100%;
        height: 12px;
        background: ${props => props.theme.table.divider};
        border-bottom: 3px solid ${props => props.theme.background[2]};
        display: ${props => (props.readOnly ? "none" : "block")};
      }

      &:hover::after {
        background: ${props => props.theme.text[2]};
      }

      &.first::after {
        border-top-left-radius: 3px;
      }

      &.last::after {
        border-top-right-radius: 3px;
      }

      &.selected::after {
        background: ${props => props.theme.primary};
      }
    }

    .grip-row {
      &::after {
        content: "";
        cursor: pointer;
        position: absolute;
        left: -16px;
        top: 0;
        height: 100%;
        width: 12px;
        background: ${props => props.theme.table.divider};
        border-right: 3px solid ${props => props.theme.background[2]};
        display: ${props => (props.readOnly ? "none" : "block")};
      }

      &:hover::after {
        background: ${props => props.theme.text[2]};
      }

      &.first::after {
        border-top-left-radius: 3px;
      }

      &.last::after {
        border-bottom-left-radius: 3px;
      }

      &.selected::after {
        background: ${props => props.theme.primary};
      }
    }

    .grip-table {
      &::after {
        content: "";
        cursor: pointer;
        background: ${props => props.theme.table.divider};
        width: 13px;
        height: 13px;
        border-radius: 13px;
        border: 2px solid ${props => props.theme.background[2]};
        position: absolute;
        top: -18px;
        left: -18px;
        display: ${props => (props.readOnly ? "none" : "block")};
      }

      &:hover::after {
        background: ${props => props.theme.text[2]};
      }

      &.selected::after {
        background: ${props => props.theme.primary};
      }
    }
  }

  .scrollable {
    overflow-y: hidden;
    overflow-x: auto;
    padding-left: 1em;
    margin-left: -1em;
    border-left: 1px solid transparent;
    border-right: 1px solid transparent;
    transition: border 250ms ease-in-out 0s;
    padding-bottom: 0.2rem;
  }

  .scrollable-shadow {
    position: absolute;
    top: 0;
    bottom: 0;
    left: -1em;
    width: 16px;
    transition: box-shadow 250ms ease-in-out;
    border: 0 solid transparent;
    border-left-width: 1em;
    pointer-events: none;

    &.left {
      box-shadow: 16px 0 16px -16px inset rgba(0, 0, 0, 0.25);
      border-left: 1em solid ${props => props.theme.background[2]};
    }

    &.right {
      right: 0;
      left: auto;
      box-shadow: -16px 0 16px -16px inset rgba(0, 0, 0, 0.25);
    }
  }

  // Bold
  b,
  strong {
    font-weight: 600;
  }

  // Code
  code {
    border-radius: 4px;
    padding: 3px 4px;
    font-family: ${props => props.theme.fontFamilyMono};
    font-size: 85%;
    color: ${props => props.theme.code.text};
    background: ${props => props.theme.code.background};
  }

  // Highlight
  mark {
    border-radius: 1px;
    color: ${props => props.theme.highlight.text};
    background: ${props => props.theme.highlight.background};
  }

  // Link
  a {
    color: ${props => props.theme.primary};
  }

  a:hover {
    text-decoration: ${props => (props.readOnly ? "underline" : "none")};
  }

  // Placeholder
  .placeholder {
    &:before {
      display: block;
      content: ${props => (props.readOnly ? "" : "attr(data-empty-text)")};
      pointer-events: none;
      height: 0;
      color: ${props => props.theme.text[1]};
    }
  }

  // Pre
  pre {
    display: block;
    overflow-x: auto;
    padding: 0.75em 1em;
    line-height: 1.4em;
    position: relative;
    background: ${props => props.theme.code.background};
    border-radius: 4px;
    -webkit-font-smoothing: initial;
    font-family: ${props => props.theme.fontFamilyMono};
    font-size: 13px;
    direction: ltr;
    text-align: left;
    white-space: pre;
    word-spacing: normal;
    word-break: normal;
    -moz-tab-size: 4;
    -o-tab-size: 4;
    tab-size: 4;
    -webkit-hyphens: none;
    -moz-hyphens: none;
    -ms-hyphens: none;
    hyphens: none;
    color: ${props => props.theme.code.text};
    margin: 0;

    code {
      font-size: 13px;
      background: none;
      padding: 0;
      border: 0;
    }
  }

  // Image
  .image {
    text-align: center;
    max-width: 100%;
    clear: both;

    img {
      pointer-events: ${props => (props.readOnly ? "initial" : "none")};
      display: inline-block;
      max-width: 100%;
      max-height: 75vh;
    }
  }

  .image.placeholder {
    position: relative;
    background: ${props => props.theme.background[2]};

    img {
      opacity: 0.5;
    }
  }

  .image-right-50 {
    float: right;
    width: 50%;
    margin-left: 2em;
    margin-bottom: 1em;
    clear: initial;
  }

  .image-left-50 {
    float: left;
    width: 50%;
    margin-right: 2em;
    margin-bottom: 1em;
    clear: initial;
  }

  // Details
  details {
    background: ${props => props.theme.background[1]};
    border-radius: 8px;
    padding: 10px 0 10px 1em;

    summary {
      outline: none;
    }
  }

  // CodeBlock & MonacoEditor
  .code-block,
  .notice-block {
    position: relative;
    margin: 0.5em 0;

    > section {
      width: 100%;

      &.hidden {
        visibility: hidden;
      }

      &.code-editor {
        position: relative;
        min-height: 300px;

        > section {
          position: absolute !important;
        }
      }
    }

    .toolbar {
      position: absolute;
      z-index: 1;
      top: 4px;
      right: 4px;

      select,
      button {
        background: ${props => props.theme.reverse.background[2]};
        color: ${props => props.theme.reverse.text[2]};
        border-width: 1px;
        font-size: 13px;
        display: none;
        border-radius: 4px;
        padding: 2px;
        margin: 0 2px;
      }

      button {
        padding: 2px 4px;
      }

      select:focus,
      select:active {
        display: inline;
      }
    }

    &:hover .toolbar {
      select {
        display: inline;
      }

      button {
        display: inline;
      }
    }
  }

  // Notice
  .notice-block {
    display: flex;
    align-items: center;
    background: ${props => props.theme.noticeInfoBackground};
    color: ${props => props.theme.noticeInfoText};
    border-radius: 4px;
    padding: 8px 16px;
    margin: 8px 0;

    a {
      color: ${props => props.theme.noticeInfoText};
    }

    a:not(.heading-name) {
      text-decoration: underline;
    }
  }

  .notice-block .icon {
    width: 24px;
    height: 24px;
    align-self: flex-start;
    margin-right: 4px;
    position: relative;
    top: 1px;
  }

  .notice-block.tip {
    background: ${props => props.theme.noticeTipBackground};
    color: ${props => props.theme.noticeTipText};

    a {
      color: ${props => props.theme.noticeTipText};
    }
  }

  .notice-block.warning {
    background: ${props => props.theme.noticeWarningBackground};
    color: ${props => props.theme.noticeWarningText};

    a {
      color: ${props => props.theme.noticeWarningText};
    }
  }

  // Blockquote
  blockquote {
    margin: 0.5em 0;
    padding-left: 1em;
    font-style: italic;
    overflow: hidden;
    position: relative;

    &:before {
      content: "";
      display: inline-block;
      width: 3px;
      border-radius: 1px;
      position: absolute;
      margin-left: -16px;
      top: 0;
      bottom: 0;
      background: ${props => props.theme.primary};
    }

    p:last-of-type {
      margin-bottom: 2px;
    }
  }

  // List
  li {
    position: relative;
  }

  ul,
  ol {
    margin: 0.5em 0.1em;
    padding: 0 0 0 1.2em;

    ul,
    ol {
      margin: 0;
    }
  }

  ol ol {
    list-style: lower-alpha;
  }

  ol ol ol {
    list-style: lower-roman;
  }

  ul.checkbox_list {
    list-style: none;
    padding-left: 0;
  }

  ul.checkbox_list li {
    display: flex;
  }

  ul.checkbox_list li.checked > div > p {
    color: ${props => props.theme.text[1]};
    text-decoration: line-through;
  }

  ul.checkbox_list li input {
    pointer-events: ${props => props.readOnly && "none"};
    opacity: ${props => props.readOnly && 0.75};
    margin: 0 0.5em 0 0;
    width: 16px;
    height: 16px;
    appearance: none;
    position: relative;
    border: 1px solid ${props => props.theme.text[1]};
    top: 2px;
    border-radius: 4px;

    &:checked {
      background: ${props => props.theme.primary};
      border-color: transparent;

      &:before {
        line-height: 1;
        position: absolute;
        top: -1px;
        left: -1px;
        width: 16px;
        height: 16px;
        content: url('data:image/svg+xml; utf8, <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" style="fill:rgb(255,255,255);"><path d="M10 15.586L6.707 12.293 5.293 13.707 10 18.414 19.707 8.707 18.293 7.293z"></path></svg>');
      }
    }
  }

  li p:first-child {
    margin: 0;
    word-break: break-word;
  }

  // Embed
  .embed {
    margin: 0.5em 0;
  }

  // Media
  @media print {
    .placeholder {
      display: none;
    }

    .block-menu-trigger {
      display: none;
    }

    em,
    blockquote {
      font-family: "SF Pro Text", ${props => props.theme.fontFamily};
    }
  }
`;

export default StyledEditor;
