/**
 * A wrapper for retrieving binary requests
 */

import Response from 'response';
import utils from 'utils';

// axios response.data is a readable stream in Node.js
class Binary extends Response {
  toString() {
    return `Binary ${this.url}`;
  }
}

if (!utils.isNodeEnv()) {
  Binary.prototype.getBlobUrl = function getBlobUrl() {
    if (!this.blobUrl) {
      this.blobUrl = window.URL.createObjectURL(
        new Blob([this.data])
      );
    }
    return this.blobUrl;
    /**
     * FYI older browser support
     * https://stackoverflow.com/a/10473992/3973896
     * https://stackoverflow.com/a/49131423/3973896
     */
  };

  Binary.prototype.download = function download(filename = 'binary') {
    // trigger browser's download dialog
    this.getBlobUrl();
    const link = document.createElement('a');
    link.href = this.blobUrl;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  Binary.prototype.removeBlobUrl = function removeBlobUrl() {
    if (this.blobUrl) {
      window.URL.revokeObjectURL(this.blobUrl);
    }
    this.blobUrl = undefined;
  };
}

export default Binary;
