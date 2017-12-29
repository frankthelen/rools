const Rools = require('../src');
require('./setup');

describe('Rules.register()', () => {
  let rools;

  before(() => {
    rools = new Rools({ debug: true });
  });

  after(() => {
  });

  it('should not throw error if rules are correct', () => {
    const rule = {
      name: 'mood is great if 200 stars or more',
      when: facts => facts.user.stars >= 200,
      then: (facts) => {
        facts.user.mood = 'great';
      },
    };
    expect(() => rools.register(rule)).to.not.throw();
  });

  it('should throw error if rule has no "name"', () => {
    const rule = {
      when: facts => facts.user.stars >= 200,
      then: (facts) => {
        facts.user.mood = 'great';
      },
    };
    expect(() => rools.register(rule)).to.throw();
  });

  it('should throw error if rule has no "when"', () => {
    const rule = {
      name: 'mood is great if 200 stars or more',
      then: (facts) => {
        facts.user.mood = 'great';
      },
    };
    expect(() => rools.register(rule)).to.throw();
  });

  it('should throw error if rule has no "then"', () => {
    const rule = {
      name: 'mood is great if 200 stars or more',
      when: facts => facts.user.stars >= 200,
    };
    expect(() => rools.register(rule)).to.throw();
  });
});
