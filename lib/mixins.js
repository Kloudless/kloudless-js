import request from 'request';
import utils from 'utils';

/* mixins to do get, post, delete, patch, put requests */
const httpMethods = {


  /* eslint-disable-next-line */
  _getClassRequestDefaults(method, options) {
    /**
     * Return default options applied to every request made from this class.
     * Override this method to set up default options
     *
     * options: the options passed in for this request
     */
    return {};
  },

  _request(method, options = {}) {
    /**
     * Additional options:
     * urlPrefix: URL prefix, only used in this mixin and not passed to
     * request().
     * The request URL will be `${options.urlPrefix}${options.url}`.
     * Define this key when overriding this function
     */
    const classDefaults = this._getClassRequestDefaults(method, options);
    // call deepMerge to handle merging object options like
    // `params` and `headers`
    const _options = utils.deepMerge(
      {
        url: '',
        urlPrefix: '',
      },
      classDefaults,
      options
    );

    _options.method = method;
    _options.url = `${_options.urlPrefix}${_options.url}`;
    delete _options.urlPrefix;

    return request(_options);
  },

  get(options) {
    return this._request('GET', options);
  },

  patch(options) {
    return this._request('PATCH', options);
  },

  post(options) {
    return this._request('POST', options);
  },

  delete(options) {
    return this._request('DELETE', options);
  },

  put(options) {
    return this._request('PUT', options);
  },
};

export default {
  httpMethods,
};

export { httpMethods };
