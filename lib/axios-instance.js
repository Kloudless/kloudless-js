
import utils from 'utils';


let axios;

if (utils.isNodeEnv()) {
  /**
   * Always use axios from node_modules in Node.js environment
   * because the bundled distribution will contain browser version
   *
   * axios-node will be resolved as an alias of axios by webpack or babel
   */
  axios = require('axios-node');
} else {
  axios = require('axios');
}

export default axios.create();
