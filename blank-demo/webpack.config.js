const path = require('path');

module.exports = {
  entry: './src/game.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      { test: /\.ts?$/, use: 'ts-loader', exclude: /node_modules/ },
      { test: /\.js?$/, type: 'javascript/auto' },
      { test: /\.js?$/, resolve: { fullySpecified: false } },
      { test: /\.png$|\.wav$/, type: 'asset/resource' },
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
  }
};