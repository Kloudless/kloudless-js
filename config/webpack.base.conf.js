const path = require('path');
const common = require('./common');


function generateConfig(env = {}) {
  return {
    /**
     * Use web build for better compatibility across web/node in general.
     * This means the bundled axios can only be used in web.
     * 'externals' option is used to handle using axios in Nodejs (see below)
     */
    target: 'web',
    mode: env.mode,
    entry: env.entry,
    resolve: {
      extensions: ['.js'],
      modules: common.resolvePaths,
    },
    externals: {
      crypto: 'crypto',
      stream: 'stream',
      /**
       * axios-node will be used when running in Nodejs environment
       * (see lib/request.js).
       * Make it as an alias of axios and not bundling it during webpack
       * transpiration, when running in Nodejs, the one in node_modules will be
       * imported.
       */
      'axios-node': 'axios',
    },
    node: {
      Buffer: false,
    },
    output: env.output,
    module: {
      rules: [
        {
          enforce: 'pre',
          test: /\.js$/,
          exclude: [
            path.resolve(__dirname, '../node_modules/'),
          ],
          loader: 'eslint-loader',
          options: {
            /* eslint-disable-next-line */
            formatter: require('eslint-friendly-formatter'),
            emitWarning: true, // emitError: true in prod
          },
        },
        {
          test: /\.js$/,
          loader: 'babel-loader',
        },
      ],
    },
    plugins: [].concat(env.plugins),
    devtool: '#source-map',
    optimization: Object.assign({
      noEmitOnErrors: true,
    }, env.optimization),
  };
}

module.exports = generateConfig;
