import utils from 'utils';

describe('Test utils', () => {
  it('isNodeEnv() should be true', () => {
    expect(utils.isNodeEnv()).toBe(true);
  });
});
