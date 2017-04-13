const path = require("path")
const webpack = require("webpack")

module.exports = {
  entry: path.resolve(__dirname, 'src/renderer.tsx'),
  output: {
    path: path.resolve(__dirname, "dist/assets"),
    publicPath: "/assets/",
    filename: 'renderer.js',
  },
  target: "electron-renderer",
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    loaders: [
      {
        test: /\.json$/,
        use: 'json-loader',
      },
      {
        test: /\.tsx?$/,
        use: {
          loader: 'awesome-typescript-loader',
          options: {
            useCache: true
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
              importLoaders: 1,
              localIdentName: '[name]__[local]___[hash:base64:5]',
            }
          },
        ],
      },
      {
        test: /\.(jpg|png|woff|woff2|eot|ttf|svg)/,
        use: 'file-loader',
      },
    ],
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
  ],
  devtool: "inline-source-map",
  devServer: {
    contentBase: './dist',
    port: 23000,
    inline: true,
  },
}
