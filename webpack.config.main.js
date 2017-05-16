const path = require('path')

module.exports = {
  entry: path.resolve(__dirname, 'src/main.ts'),
  output: {
    path: path.resolve(__dirname, 'dist/assets'),
    filename: 'main.js',
    libraryTarget: 'commonjs'
  },
  target: 'electron',
  resolve: {
    extensions: ['.ts', '.js']
  },
  externals: require('webpack-node-externals')(),
  module: {
    loaders: [
      {
        test: /\.ts$/,
        use: 'awesome-typescript-loader'
      }
    ]
  }
}
