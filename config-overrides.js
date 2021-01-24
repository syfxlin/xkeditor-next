// eslint-disable-next-line @typescript-eslint/no-var-requires
const MonacoEditorWebpackPlugin = require("monaco-editor-webpack-plugin");

module.exports = {
  webpack: function(config, env) {
    config.plugins.push(new MonacoEditorWebpackPlugin());
    return config;
  }
};
