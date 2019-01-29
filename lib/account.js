import utils from 'utils';
import { httpMethods } from 'mixins';

class Account {
  // id, token
  constructor(props = {}) {
    utils.verifyOptions(props, [
      { property: 'token', type: 'string', required: true },
      { property: 'data', type: 'object' },
      { property: 'tokenType', type: 'string' },
    ]);

    const _props = Object.assign({
      data: {},
    }, props);

    this.token = _props.token;
    this.tokenType = 'Bearer';
    this._setAccountDetail(_props.data);

    // accept initializing an account with id and APIKey in node env
    if (props.tokenType === 'APIKey') {
      if (!utils.isNodeEnv()) {
        throw 'Using APIKey is not allowed in browsers';
      }
      utils.verifyOptions(props, [
        { property: 'accountId', required: true },
      ]);
      this.tokenType = 'APIKey';
      this.id = props.accountId;
    }

    this.defaults = {};
  }

  _setAccountDetail(data = {}) {
    this.id = data.id || null;
    this.data = data;
  }

  getDetail() {
    return this.get({
      wrapResponse: false,
    }).then((response) => {
      const { data } = response;
      this._setAccountDetail(data);
      return data;
    });
  }

  _getClassRequestDefaults() {
    const accountId = this.tokenType === 'APIKey' ? this.id : 'me';
    return utils.deepMerge(
      {
        urlPrefix: `accounts/${accountId}/`,
        headers: {
          Authorization: `${this.tokenType} ${this.token}`,
        },
      },
      this.defaults
    );
  }

  raw(options = {}) {
    const _options = Object.assign({
      headers: {},
    }, options);

    if (!_options.url) {
      throw 'Request URL is not specified';
    }

    _options.headers['X-Kloudless-Raw-URI'] = _options.url;
    _options.url = 'raw/';

    _options.headers['X-Kloudless-Raw-Method'] = _options.method || 'GET';
    delete _options.method;

    return this.post(_options);
  }

  encodeRawId(rawIdData = {}) {
    const _options = {
      url: 'encode_raw_id/',
      data: rawIdData,
    };
    return this.post(_options);
  }


  toString() {
    return `Account ${this.id || this.token}`;
  }
}

utils.applyMixins(Account, httpMethods);

export default Account;
