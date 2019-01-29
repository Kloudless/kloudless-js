/**
 * General API response wrapper
 * Wrappers for specific types of response should extend this class
 */
import utils from 'utils';
import { httpMethods } from 'mixins';

// Only apply these headers as default headers when making requests.
const defaultHeaderKeys = [
  'Authorization', 'X-Kloudless-Raw-Data', 'X-Kloudless-As-User'];

// Do not record these properties for refresh options
// and class defaults
const excludeRefreshOptionsKeys = [
  'method', 'baseURL', 'data',
];

// Do not record these properties for class defaults
const excludeClassDefaultsKeys = [
  'url', 'params',
];

class Response {
  constructor(props = {}) {
    utils.verifyOptions(props, [
      { property: 'response', type: 'object' },
      { property: 'url', type: 'string', required: true },
      { property: 'requestOptions', type: 'object' },
    ]);

    const _props = Object.assign({
      response: {},
      requestOptions: {},
    }, props);

    /**
     * Record axios response object properties for arbitrary processing:
     * response = { data, status, statusText, headers, config, request }
     */
    Object.assign(this, _props.response);

    /**
     * The object can also be initialized by manually supplying data.
     * Used when the data is not from API response, like creating Resources
     * from a ResourceList, each Resource is from the response of
     * requesting ResourceList.
     * This property can also be used to create objects in tests.
     */
    if (typeof this.data === 'undefined'
        && typeof _props.data !== 'undefined') {
      this.data = _props.data;
    }

    this.url = _props.url;

    // keep a separate copy of params and headers for refresh()
    this._refreshOptions = utils.deepMerge({}, _props.requestOptions);
    excludeRefreshOptionsKeys.forEach((key) => {
      delete this._refreshOptions[key];
    });

    /**
     * Record request defaults for this object.
     * Only record defaultHeaderKeys for headers, and don't
     * record keys in excludeClassDefaultsKeys at all
     */
    const headers = {};
    const defaultHeaders = this._refreshOptions.headers || {};

    defaultHeaderKeys.forEach((key) => {
      if (typeof defaultHeaders[key] !== 'undefined') {
        headers[key] = defaultHeaders[key];
      }
    });

    this.defaults = utils.deepMerge(
      {},
      this._refreshOptions,
      { headers }
    );

    excludeClassDefaultsKeys.forEach((key) => {
      delete this.defaults[key];
    });
  }

  _getClassRequestDefaults(method, options) {
    if (options.refresh === true) {
      delete options.refresh;
      return this._refreshOptions;
    }

    const _options = Object.assign({
      urlPrefix: this.url,
    },
    this.defaults);

    if (method !== 'GET') {
      delete _options.params;
    }
    return _options;
  }

  refresh() {
    return this.get({ refresh: true }).then((response) => {
      Object.assign(this, response);
    });
  }

  toString() {
    return `Response ${this.url}`;
  }
}

utils.applyMixins(Response, httpMethods);

export default Response;
