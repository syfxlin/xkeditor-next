const base = {
  fontFamily:
    "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen, Ubuntu,Cantarell,'Open Sans','Helvetica Neue',sans-serif",
  fontFamilyMono:
    "'SFMono-Regular',Consolas,'Liberation Mono', Menlo, Courier,monospace",
  fontWeight: 400,
  zIndex: 100,
  primary: "#007BFF",

  // Notice
  noticeInfoBackground: "#F5BE31",
  noticeInfoText: "rgba(0, 0, 0, 0.9)",
  noticeTipBackground: "#9E5CF7",
  noticeTipText: "#FFF",
  noticeWarningBackground: "#FF5C80",
  noticeWarningText: "#FFF"
};

const lightOrigin = {
  ...base,
  // Text
  text: ["rgba(0, 0, 0, 0.2)", "rgba(0, 0, 0, 0.5)", "rgba(0, 0, 0, 0.9)"],
  // Background
  background: ["#E6E6E6", "#F7F7F7", "#FFF"],
  // Selected
  selected: {
    text: "#000",
    background: "rgba(0, 0, 0, 0.2)"
  },
  // Hover
  hover: {
    background: "rgba(0, 0, 0, 0.07)"
  },
  // Shadow & Divider
  shadow: "rgba(0, 0, 0, 0.08)",
  divider: "rgba(0, 0, 0, 0.2)",
  // Code
  code: {
    text: "#c7254e",
    background: "rgba(0, 0, 0, 0.06)"
  },
  // Highlight
  highlight: {
    text: "rgba(0, 0, 0, 0.9)",
    background: "rgba(255, 224, 0, 0.5)"
  },
  // Table
  table: {
    divider: "rgba(0, 0, 0, 0.2)",
    header: "#FFF",
    selected: "#E5F7FF"
  }
};

const darkOrigin = {
  ...base,
  // Text
  text: [
    "rgba(204, 204, 204, 0.2)",
    "rgba(204, 204, 204, 0.5)",
    "rgba(255, 255, 255, 0.9)"
  ],
  // Background
  background: ["#454545", "#303030", "#181A1B"],
  // Selected
  selected: {
    text: "#CCCCCC",
    background: "rgba(204, 204, 204, 0.2)"
  },
  // Hover
  hover: {
    background: "rgba(204, 204, 204, 0.07)"
  },
  // Shadow & Divider
  shadow: "rgba(0, 0, 0, 0.08)",
  divider: "rgba(204, 204, 204, 0.2)",
  // Code
  code: {
    text: "#c7254e",
    background: "rgba(204, 204, 204, 0.08)"
  },
  // Highlight
  highlight: {
    text: "rgba(255, 255, 255, 0.9)",
    background: "rgba(255, 177, 80, 0.3)"
  },
  // Table
  table: {
    divider: "rgba(204, 204, 204, 0.2)",
    header: "#181A1B",
    selected: "#002333"
  }
};

export const light = {
  ...lightOrigin,
  reverse: darkOrigin
};

export const dark = {
  ...darkOrigin,
  reverse: lightOrigin
};

export type Theme = typeof light;
