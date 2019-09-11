
const utils = {
  isNodeEnv() {
    return typeof window === 'undefined';
  },
  applyMixins(classFunc, mixins) {
    // Object.assign doesn't work on Function.prototype
    Object.keys(mixins).forEach((name) => {
      if (!classFunc.prototype[name]) {
        classFunc.prototype[name] = mixins[name];
      }
    });
  },
  verifyOptions(options = {}, fields = []) {
    fields.forEach((field) => {
      let property;
      let type;
      let required;

      if (typeof field === 'object') {
        ({ property, type, required } = field);
      } else {
        property = field;
        required = true;
      }

      if (required && typeof options[property] === 'undefined') {
        throw `invalid options: ${property} is required`;
      }

      if (type && typeof options[property] !== 'undefined') {
        if (
          typeof type === 'function' && !(options[property] instanceof type)) {
          throw `invalid options: ${property} should be an instance of ${type}`;
        }

        /* eslint-disable valid-typeof */
        if (typeof type === 'string' && typeof options[property] !== type) {
          /* eslint-enable */
          throw `invalid options: ${property} should be a ${type}`;
        }
      }
    });
  },
  isPlainObject(obj) {
    /** Check if object is plain object and not a class instance.
     * Used to filter out special object types in axios request data options
     * like Buffer, Stream, or Blob.
     */
    return (obj !== null && typeof obj === 'object'
              && obj.constructor === ({}).constructor);
  },
  deepMerge(...objs) {
    /**
     * Modified from deepMerge() in axios/lib/utils.js, but also handle Arrays
     * and other class objects.
     */
    const result = {};
    objs.forEach((obj) => {
      if (obj === null || typeof obj !== 'object') {
        return;
      }

      Object.keys(obj).forEach((key) => {
        const val = obj[key];
        if (val instanceof Array) {
          result[key] = val.concat([]);
        } else if (
          utils.isPlainObject(result[key]) && utils.isPlainObject(val)) {
          result[key] = utils.deepMerge(result[key], val);
        } else if (utils.isPlainObject(val)) {
          result[key] = utils.deepMerge({}, val);
        } else {
          result[key] = val;
        }
      });
    });
    return result;
  },
};

export default utils;
