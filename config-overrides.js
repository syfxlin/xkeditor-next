const {
  addLessLoader,
  override,
  addBabelPlugin,
  addWebpackPlugin
} = require("customize-cra");
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
//   .BundleAnalyzerPlugin;

module.exports = {
  webpack: override(
    addLessLoader(),
    addBabelPlugin("babel-plugin-styled-components")
    // addWebpackPlugin(new BundleAnalyzerPlugin())
  )
};
