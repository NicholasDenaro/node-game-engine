import path from 'path';

const config = env => {
  console.log(env);
  console.log(env.assets);
  const assets = env.assets.split(',').join('|');
  console.log(assets);
  const assetRegex = new RegExp(`\.(${assets})$`);
  return {
    output: {
      path: path.resolve(path.dirname('.'), 'dist'),
      filename: 'bundle.js',
    },
    module: {
      rules: [
        { test: /\.ts?$/, use: 'ts-loader', exclude: /node_modules/ },
        { test: /\.js?$/, type: 'javascript/auto' },
        { test: /\.js?$/, resolve: { fullySpecified: false } },
        { test: assetRegex, type: 'asset/resource' },
        { test: /\.(tmx)$/, type: 'asset/source' },
      ]
    },
    resolve: {
      extensions: ['.ts', '.js'],
    }
  }
};

export default config;