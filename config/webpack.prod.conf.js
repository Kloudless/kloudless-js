const path = require('path');

const generateConfig = require('./webpack.base.conf.js');

const entryPath = path.resolve(__dirname, '../lib/kloudless.js');

const distPath = path.resolve(__dirname, '../dist/');

const prodConfig = {
  mode: 'production',
  entry: {
    kloudless: [entryPath],
  },
  output: {
    path: distPath,
    filename: '[name].js',
    publicPath: './',
    library: ['Kloudless', 'sdk'],
    libraryTarget: 'umd',
    libraryExport: 'default',
    /** patch 'window is not defined' error in Nodejs
      * https://github.com/webpack/webpack/issues/6784
      */
    globalObject: 'typeof self !== \'undefined\' ? self : this',
  },
  plugins: [],
  optimization: {
    minimize: false,
  },
};

const minProdConfig = Object.assign({}, prodConfig, {
  entry: {
    'kloudless.min': [entryPath],
  },
  optimization: {
    minimize: true,
  },
});

module.exports = [generateConfig(prodConfig), generateConfig(minProdConfig)];
