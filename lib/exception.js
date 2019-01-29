/**
 * common exception class for failed API requests
 */
import utils from 'utils';

class Exception extends Error {
  constructor(props = {}) {
    super();
    utils.verifyOptions(props, [
      { property: 'error', type: 'object', required: true },
    ]);

    /**
     * Record axios error object properties for arbitrary processing:
     * error = { request, response, config, message }
     * 'message' is only presented when no request was made
     */
    Object.assign(this, props.error);

    /**
     * If there is a response, record error messages from response
     * instead of generic message from axios
     */
    if (this.response) {
      if (this.response.headers['content-type'] === 'application/json') {
        const { data } = this.response;
        this.statusCode = data.status_code;
        this.message = data.message;
        this.errorCode = data.error_code;
        this.data = data;
      }
      this.statusCode = this.statusCode || this.response.status;
      this.message = this.message || this.response.statusText;
      this.errorCode = this.errorCode || null;
    } else if (this.request) {
      this.message = 'There is no response from API Server';
    } else {
      /**
       * The exception is thrown before making a request
       * this.message will be provided by props.error in this case
       */
    }
  }

  toString() {
    return `Kloudless SDK Exception: ${this.message}`;
  }
}

export default Exception;
