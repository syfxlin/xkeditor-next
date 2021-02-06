const { addLessLoader, override, addBabelPlugin } = require("customize-cra");

module.exports = {
  webpack: override(
    addLessLoader(),
    addBabelPlugin("babel-plugin-styled-components")
  )
};
