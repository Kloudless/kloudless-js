/**
 * a wrapper for API responses with type="object_list"
 * a list contains Resources
 */

/**
 * A wrapper for objects in API responses
 */
import Response from 'response';
import Resource from 'resource';
import utils from 'utils';
import base from 'base';

class ResourceList extends Response {
  constructor(props = {}) {
    super(props);

    this.data = this.data || {};

    this.api = this.data.api;
    this._nextPageCursor = this.data.next_page || this.data.cursor || null;

    this.resetIterateIndex();
    /**
     * If next_page is not presented and page is number, it could be that
     * there are other pages but the next_page is not presented.
     * in this case, guess next page is page+1
     * TODO: remove this logic once we figure out the root cause of
     * next_page not showing up
     */
    if (this.data.objects.length > 0
        && typeof this.data.next_page === 'undefined'
        && !this.data.cursor
        && !Number.isNaN(this.data.page)) {
      this._nextPageCursor = String(Number(this.data.page) + 1);
    }

    /** setting variables for constructing resource URL
     * in case `href` property is no available
     */

    // find out list resource id by looping through url parts
    // search for arbitrary string >= 20 characters from the end of url
    const urls = this.url.split('/');
    let idPos;
    for (idPos = urls.length - 1; idPos >= 0; idPos -= 1) {
      if (urls[idPos].search(/^[a-zA-Z0-9=]{20,}/) === 0) {
        break;
      }
    }

    let childRequestUrlPrefix;
    if (urls[0] === 'accounts') {
      if (this.api === 'storage') {
        // for storage, child resources does not need parent resource in url
        childRequestUrlPrefix = `${urls[0]}/${urls[1]}/${urls[2]}/`;
      } else if (idPos !== -1) {
        // prepend parent resource url if list resource id exists
        childRequestUrlPrefix = urls.slice(0, idPos + 1).join('/');
        childRequestUrlPrefix += '/';
      } else {
        // otherwise just prepend accounts/{api}/{type}
        childRequestUrlPrefix = `${urls[0]}/${urls[1]}/${urls[2]}/`;
      }
    } else {
      // meta, public
      childRequestUrlPrefix = `${urls[0]}/`;
    }

    this.objects = [];
    this.data.objects.forEach((obj) => {
      /**
       * use 'href' property if available
       * href property is the absolute path to the resource, so removing
       * baseUrl part before passing it into Resource
       */
      const url = obj.href ? String(obj.href).replace(base.getBaseUrl(), '')
        : `${childRequestUrlPrefix}${obj.type}s/`
          + `${Resource.getId(obj)}/`;
      this.objects.push(new Resource({
        // no request was made to get this resource,
        // so only provides resource data
        data: obj,
        requestOptions: Object.assign({}, this.defaults),
        url,
      }));
    });
  }

  toString() {
    return `ResourceList ${this.url}`;
  }

  _getPageParamName() {
    return this.url.search(/^accounts\/[^/]+\/events\/$/) === 0
      ? 'cursor' : 'page';
  }

  _createEmptyResourceList() {
    const defaults = Object.assign({
      params: {},
    }, this.defaults);

    // set page id to null
    defaults.params[this._getPageParamName()] = null;

    return new ResourceList({
      data: {
        count: 0,
        objects: [],
        type: 'object_list',
      },
      url: this.url,
      requestOptions: defaults,
    });
  }

  getNextPage() {
    const paramName = this._getPageParamName();
    if (this._nextPageCursor) {
      const pageSize = this._refreshOptions.params
        ? this._refreshOptions.params.page_size : undefined;
      return this.get({
        params: {
          [paramName]: this._nextPageCursor,
          page_size: pageSize,
        },
      }).catch((exception) => {
        // if page is number and we guessed next_page is page+1
        // but it does not exist
        if (exception.errorCode === 'not_found') {
          return Promise.resolve(this._createEmptyResourceList());
        }
        throw exception;
      });
    }
    return Promise.resolve(this._createEmptyResourceList());
  }

  // resolve with hasRemainResources: boolean
  _doIterate(options, counter) {
    const { resourceList } = this._iterateRefs;
    const { objects } = resourceList;

    if (objects.length > 0) {
      for (let i = this._iterateRefs.objectIndex; i < objects.length; i += 1) {
        options.callback(objects[i]);
        /* eslint-disable-next-line */
        counter += 1;

        if (counter === options.maxResources) {
          // have iterated max number of resources,
          // record current object index and terminate iteration
          this._iterateRefs.objectIndex = i + 1;
          if (this._iterateRefs.objectIndex === objects.length) {
            // if reached the end of current page, the index should be the
            // beginning of the next page
            return resourceList.getNextPage().then((nextResourceList) => {
              this._iterateRefs.objectIndex = 0;
              this._iterateRefs.resourceList = nextResourceList;
              // verify if the next page has objects, if not
              // then the iteration is finished
              const hasRemainResources = nextResourceList.objects.length > 0;
              return Promise.resolve(hasRemainResources);
            });
          }
          return Promise.resolve(true);
        }
      }
      // query the next page and continue iteration
      return resourceList.getNextPage().then((nextResourceList) => {
        this._iterateRefs.resourceList = nextResourceList;
        this._iterateRefs.objectIndex = 0;
        return this._doIterate(options, counter);
      });
    }

    // all resources have been iterated
    return Promise.resolve(false);
  }

  iterate(options = {}) {
    utils.verifyOptions(options, [
      { property: 'callback', type: Function, required: true },
      { property: 'maxResources', type: 'number' },
    ]);
    const _options = Object.assign({}, options);

    if (typeof _options.maxResources === 'number') {
      // if _options.maxResources is a float,
      // _options.maxResources !== maxResources will fail and raise exception
      const maxResources = Math.floor(_options.maxResources);
      if (_options.maxResources < 1 || _options.maxResources !== maxResources) {
        throw 'options.maxResources must be a positive integer';
      }
    } else {
      _options.maxResources = Number.POSITIVE_INFINITY;
    }

    return this._doIterate(_options, 0);
  }

  resetIterateIndex() {
    /**
     * Record the last resource object visited in iterate().
     * Used when maxResources is specified and we need to run iterate()
     * multiple times to go through all resources.
     */
    this._iterateRefs = {
      resourceList: this,
      objectIndex: 0,
    };
  }
}

export default ResourceList;
