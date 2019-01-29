import utils from 'utils';

describe('Test utils', () => {
  it('isNodeEnv() should be false', () => {
    expect(utils.isNodeEnv()).toBe(false);
  });
});
