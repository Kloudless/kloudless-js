/**
 * A wrapper for objects in API responses
 */

import Response from 'response';
import base from 'base';


// Possible property names for resource ID
// key: meta apiKeys, name: public/services
const idPropertyNames = ['id', 'key', 'name'];

class Resource extends Response {
  constructor(props = {}) {
    super(props);
    this.id = Resource.getId(this.data);
    if (typeof this.id === 'undefined') {
      this.id = null;
    }

    if (props.requestOptions.method === 'POST') {
      /** For POST requests, the request URL won't have the resource ID,
       * so we cannot use request URL as this object's URL.
       * Get the actual resource URL from href or guess it
       */
      if (this.data.href) {
        this.setUrl(Resource.parseHref(this.data.href));
      } else if (this.id) {
        this.setUrl(`${props.url}${this.id}/`);
      }
    }

    this.api = this.data.api || null;
    this.type = this.data.type || null;
  }

  toString() {
    // TODO: use href to generate this string
    return `Resource ${this.api}/${this.type}s/${this.id}`;
  }
}

Resource.getId = function getId(apiResponse) {
  for (let i = 0; i < idPropertyNames.length; i += 1) {
    const propertyName = idPropertyNames[i];
    if (typeof apiResponse[propertyName] !== 'undefined') {
      return apiResponse[propertyName];
    }
  }
  return undefined;
};

Resource.parseHref = function parseHref(href) {
  return String(href).replace(base.getBaseUrl(), '');
};

export default Resource;
