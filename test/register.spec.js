const { ruleMoodGreat: rule } = require('./rules/mood');
const Rools = require('../src');
require('./setup');

describe('Rules.register()', () => {
  let rools;

  before(() => {
    rools = new Rools();
  });

  it('should not throw error if rules are correct', () => {
    expect(() => rools.register({ ...rule })).to.not.throw();
  });

  it('should throw error if rule has no "name"', () => {
    expect(() => rools.register({ ...rule, name: undefined })).to.throw();
  });

  it('should throw error if rule has no "when"', () => {
    expect(() => rools.register({ ...rule, when: undefined })).to.throw();
  });

  it('should throw error if rule has no "then"', () => {
    expect(() => rools.register({ ...rule, then: undefined })).to.throw();
  });
});
