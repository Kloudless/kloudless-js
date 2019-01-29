/* global BASE_URL */

import utils from 'utils';
import Account from 'account';

let baseUrl;
let apiVersion = 1;

const baseFuncs = {
  setBaseUrl(url) {
    baseUrl = url;
    if (baseUrl[baseUrl.length - 1] !== '/') {
      baseUrl += '/';
    }
  },
  setApiVersion(version) {
    apiVersion = version;
  },
  getBaseUrl(version) {
    return `${baseUrl}v${version || apiVersion}/`;
  },
  verifyToken(options = {}) {
    utils.verifyOptions(options, [
      { property: 'appId', type: 'string', required: true },
      { property: 'token', type: 'string', required: true },
      { property: 'initAccount', type: 'boolean' },
    ]);

    const { appId, token, initAccount } = options;

    return this.get({
      url: 'oauth/token',
      version: 1,
      headers: {
        Authorization: `Bearer ${options.token}`,
      },
      wrapResponse: false,
    }).then((response) => {
      const { data } = response;
      if (data.client_id !== appId) {
        return {
          valid: false,
          error: 'appId does not match',
        };
      }
      return { valid: true };
    }).catch((exception) => {
      if (exception.response && exception.statusCode === 400) {
        return {
          valid: false,
          error: 'Invalid token',
        };
      }
      throw exception;
    }).then((result) => {
      if (result.valid && initAccount) {
        const account = new Account({
          token,
        });
        return account.getDetail().then(() => {
          result.account = account;
          return result;
        });
      }
      return result;
    });
  },
};

let envFuncs;
if (utils.isNodeEnv()) {
  /* eslint-disable-next-line */
  const crypto = require('crypto');
  envFuncs = {
    getAuthorizationUrl(options = {}) {
      utils.verifyOptions(options, [
        { property: 'extraData', type: 'object' },
        { property: 'redirectUri', type: 'string', required: true },
        { property: 'state', type: 'string' },
        { property: 'scope', type: 'string', required: true },
        { property: 'appId', type: 'string', required: true },
        { property: 'params', type: 'object' },
      ]);
      let { state } = options;
      if (!state) {
        const buff = crypto.randomBytes(48);
        state = buff.toString('hex');
      }
      const redirectUri = encodeURIComponent(options.redirectUri);
      let url = `${baseFuncs.getBaseUrl(1)}oauth?client_id=${options.appId}`
                  + `&redirect_uri=${redirectUri}&response_type=code`
                  + `&scope=${options.scope}&state=${state}`;

      if (options.extraData) {
        const extraData = encodeURIComponent(JSON.stringify(options.extraData));
        url += `&extra_data=${extraData}`;
      }

      if (options.params) {
        Object.keys(options.params).forEach((key) => {
          const val = options.params[key];
          url += `&${key}=${val}`;
        });
      }
      return { url, state };
    },
    completeAuth(options = {}) {
      /**
       * complete OAuth 2 Authorization Code Grant flow,
       * then resolve with Account object (with account details)
       */
      utils.verifyOptions(options, [
        { property: 'redirectUri', type: 'string', required: true },
        { property: 'oauthCallbackUrl', type: 'string', required: true },
        { property: 'state', type: 'string', required: true },
        { property: 'appId', type: 'string', required: true },
        { property: 'apiKey', type: 'string', required: true },
      ]);
      const { redirectUri, oauthCallbackUrl } = options;
      const paramsStr = oauthCallbackUrl.substr(
        oauthCallbackUrl.search(/\?/) + 1
      );
      const paramsList = paramsStr.split('&');
      const params = {};
      paramsList.forEach((param) => {
        const args = param.split('=');
        const [name, value] = args;
        params[name] = value;
      });

      if (options.state !== params.state) {
        throw 'Error: state is different';
      }

      const tokenParams = `grant_type=authorization_code&code=${params.code}`
                          + `&redirect_uri=${encodeURIComponent(redirectUri)}`
                          + `&client_id=${options.appId}`
                          + `&client_secret=${options.apiKey}`;

      return this.post({
        url: 'oauth/token',
        version: 1,
        headers: {
          Authorization: `APIKey ${options.apiKey}`,
          'Content-type': 'application/x-www-form-urlencoded',
        },
        data: tokenParams,
        wrapResponse: false,
      }).then((response) => {
        const { data } = response;
        return data.access_token;
      }).catch((exception) => {
        throw exception;
      });
    },
  };
} else {
  const authenticator = require(
    '@kloudless/authenticator/src/auth-widget'
  ).default;

  envFuncs = {
    setBaseUrl(url) {
      baseFuncs.setBaseUrl(url);
      // TODO: migrate to authenticator v1.1 API
      // change base url for authenticator
      if (!window.Kloudless) {
        window.Kloudless = {};
      }
      let authBaseUrl = url;
      // baseUrl in authenticator cannot have '/' at the end
      if (authBaseUrl[authBaseUrl.length - 1] === '/') {
        authBaseUrl = authBaseUrl.substr(0, authBaseUrl.length - 1);
      }
      window.Kloudless.baseUrl = authBaseUrl;
    },
    connectAccount(options = {}) {
      utils.verifyOptions(options, [
        { property: 'scope', type: 'string', required: true },
        { property: 'appId', type: 'string', required: true },
      ]);

      const promise = new Promise((resolve, reject) => {
        const auth = authenticator.authenticator(null, {
          client_id: options.appId,
          scope: options.scope,
        }, (result) => {
          if (!result.account) {
            reject(result);
            return;
          }
          const account = new Account({
            token: result.access_token,
            data: result.account,
          });
          resolve(account);
        });

        auth.launch();
      });

      return promise;
    },
  };
}


const base = Object.assign({}, baseFuncs, envFuncs);

base.setBaseUrl(BASE_URL);
export default base;
