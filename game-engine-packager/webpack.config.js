import path from 'path';

const config = env => {
  console.log(env);
  console.log(env.assets);
  const assets = env.assets;
  const assetRegex = new RegExp(assets.split(',').map(asset => `\\.${asset}$`).join('|'));
  console.log(assetRegex);

  const output = env.output;
  return {
    output: {
      path: path.resolve(path.dirname('.'), output),
      filename: 'bundle.js',
    },
    module: {
      rules: [
        { test: /\.js?$/, type: 'javascript/auto', exclude: /node_modules|dist-web|dist-electron/ },
        { test: /\.js?$/, resolve: { fullySpecified: false }, exclude: /node_modules|dist-web|dist-electron/ },
        { test: assetRegex, type: 'asset/resource', exclude: /node_modules|dist-web|dist-electron/ },
        { test: /\.tmx$|\.tsx$/, type: 'asset/resource', exclude: /node_modules|dist-web|dist-electron/ },
      ]
    },
    resolve: {
      extensions: ['.ts', '.js'],
    }
  }
};

export default config;