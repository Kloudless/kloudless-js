/* global VERSION */
/**
 * general object to handle requests to Kloudless api
 * API requests should be stateless, only create one function
 * to enforce this concept
 */
import Exception from 'exception';
import utils from 'utils';
import axios from 'axios-instance';

const isNodeEnv = utils.isNodeEnv();

// Do not import these modules on load to avoid circular dependencies.
// Instead, import them the first time request() is called
/* eslint-disable-next-line */
let Response, ResourceList, Resource, Binary, base;

function lazyImport() {
  Response = require('response').default;
  ResourceList = require('resource-list').default;
  Resource = require('resource').default;
  Binary = require('binary').default;
  base = require('base').default;
}


const binaryResourceUrlPatterns = [
  /files\/[^/]+\/contents(\/)?$/,
  /thumbnail(\/)?$/,
];


function request(options = {}) {
  if (!base) {
    lazyImport();
  }
  /**
   * version,
   * wrapResponse
   * (other axios options)
   *
   */

  // call deepMerge to handle merging object options like
  // `params` and `headers`
  const _options = utils.deepMerge(
    {
      method: 'GET',
      params: {},
      headers: {
        'Content-Type': 'application/json',
      },
    },
    options,
    {
      headers: {
        // browsers will block requests with modified User-Agent header
        [isNodeEnv ? 'User-Agent' : 'X-Kloudless-Source']:
          `kloudless-js/${VERSION}`,
      },
      baseURL: base.getBaseUrl(options.version),
    }
  );

  // record variables for wrapper objects
  let requestUrl = _options.url;
  const wrapResponse = _options.wrapResponse !== false;

  const isRawRequest = _options.headers['X-Kloudless-Raw-URI'] || false;

  /**
   * Always have '/' at the end for consistency.
   * Do not append '/' if the url is empty to prevent from having '//'
   * at the end when prepending API server base url.
   */
  if (requestUrl.length && requestUrl[requestUrl.length - 1] !== '/') {
    requestUrl += '/';
  }

  const url = `${base.getBaseUrl(_options.version)}${requestUrl}`;

  if (url.indexOf('?') > -1) {
    throw 'Please use options.params to pass query params. '
          + 'Do not put them in the URL.';
  }


  let isBinaryData = false;
  for (let i = 0; i < binaryResourceUrlPatterns.length; i += 1) {
    if (url.search(binaryResourceUrlPatterns[i]) > 0) {
      isBinaryData = true;
      break;
    }
  }

  if (isBinaryData) {
    _options.responseType = isNodeEnv ? 'stream' : 'blob';
  }

  const promise = axios(_options);
  return promise
    .then((response) => {
      if (isRawRequest || !wrapResponse) {
        return response;
      }
      let ResponseClass;
      const { data } = response;

      if (isBinaryData) {
        ResponseClass = Binary;
      } else if (
        response.headers['content-type'] === 'application/json') {
        if (data.type === 'object_list') {
          ResponseClass = ResourceList;
          // TODO: use href field instead
        } else if (typeof Resource.getId(data) !== 'undefined') {
          ResponseClass = Resource;
        } else {
          ResponseClass = Response;
        }
      } else {
        ResponseClass = Response;
      }

      return new ResponseClass({
        response,
        url: requestUrl,
        requestOptions: _options,
      });
    })
    .catch((error) => {
      throw new Exception({
        error,
      });
    });
}

export default request;
