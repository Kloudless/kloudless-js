import kloudless from 'kloudless';

describe('Test Base', () => {
  it('Base test', () => {
    expect(typeof kloudless.Account).toBe('function');
  });
});
