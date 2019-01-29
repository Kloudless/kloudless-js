/**
 * Export common variables used by webpack, babel, and jest configs
 */
module.exports = {
  /**
   * A list of paths in regexp format to specify which files / folders
   * babel should ignore.
   *
   * This list is used by
   * 1. 'ignore' option in babel.config.js
   * 2. 'transformIgnorePatterns' option in jest.conf.js
   */
  ignorePaths: [
    // ignore everything in node_modules except @kloudless/authenticator
    /node_modules\/(?!@kloudless\/authenticator)/,
  ],
  /**
   * A list of paths to resolve module imports
   *
   * This list is used by
   * 1. 'module-resolver' plugin's root option in babel.config.js
   * 2. webpack's resolve.modules option
   */
  resolvePaths: ['lib', 'node_modules'],
};
