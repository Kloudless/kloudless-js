const common = require('./config/common');
const packages = require('./package.json');

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: ['chrome > 70', 'firefox > 63'],
        useBuiltIns: 'usage',
      },
    ],
  ],
  plugins: [
    [
      'module-resolver', {
        root: common.resolvePaths,
        alias: {
          /**
           * Resolve axios-node as axios when testing Node environment
           * (i.e. when running the sdk in babel-node or jest).
           * This option is removed in production build so that webpack
           * can handle it as an external module.
           */
          'axios-node': 'axios',
        },
      },
    ],
    [
      'transform-define',
      {
        BASE_URL: process.env.BASE_URL || 'https://api.kloudless.com',
        KLOUDLESS_APP_ID: process.env.KLOUDLESS_APP_ID,
        KLOUDLESS_API_KEY: process.env.KLOUDLESS_API_KEY,
        VERSION: packages.version,
        // used in authenticator js
        DEBUG: false,
      },
    ],
  ],
  env: {
    production: {
      plugins: [
        [
          'module-resolver', {
            root: ['lib', './node_modules'],
          },
        ],
      ],
    },
  },
  /**
   * -i \"[]\" is required for babel-node in order to use 'ignore' option
   * https://github.com/babel/babel/issues/8802#issuecomment-454885472
   */
  ignore: common.ignorePaths,
};
