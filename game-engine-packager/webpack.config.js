import path from 'path';

const config = env => {
  console.log(env);
  console.log(env.assets);
  const assets = env.assets.split(',').join('|');
  console.log(assets);
  const assetRegex = new RegExp(`\.(${assets})$`);
  return {
    output: {
      path: path.resolve(path.dirname('.'), 'dist-web'),
      filename: 'bundle.js',
    },
    module: {
      rules: [
        { test: /\.js?$/, type: 'javascript/auto', exclude: /node_modules|dist-web|dist-electron/ },
        { test: /\.js?$/, resolve: { fullySpecified: false }, exclude: /node_modules|dist-web|dist-electron/ },
        { test: assetRegex, type: 'asset/resource' },
        { test: /\.tmx$|\.tsx/, type: 'asset/resource' },
      ]
    },
    resolve: {
      extensions: ['.ts', '.js'],
    }
  }
};

export default config;