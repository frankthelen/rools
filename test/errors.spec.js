const Rools = require('../src');
const { frank } = require('./facts/users')();
const { good } = require('./facts/weather')();
const {
  ruleMoodGreat, ruleMoodSad, ruleGoWalking, ruleStayAtHome,
} = require('./rules/mood');
require('./setup');

describe('Rules.evaluate()', () => {
  it('should not fail if `when` throws error', () => {
    const brokenRule = {
      name: 'broken rule #1',
      when: facts => facts.bla.blub === 'blub', // TypeError: Cannot read property 'blub' of undefined
      then: () => {},
    };
    const rools = new Rools({ logErrors: false });
    const facts = { user: frank, weather: good };
    rools.register(brokenRule, ruleMoodGreat, ruleMoodSad, ruleGoWalking, ruleStayAtHome);
    expect(() => rools.evaluate(facts)).to.not.throw();
    expect(facts.user.mood).to.be.equal('great');
    expect(facts.goWalking).to.be.equal(true);
  });

  it('should not fail if `then` throws error', () => {
    const brokenRule = {
      name: 'broken rule #2',
      when: () => true, // fire immediately
      then: (facts) => {
        facts.bla.blub = 'blub'; // TypeError: Cannot read property 'blub' of undefined
      },
    };
    const rools = new Rools({ logErrors: false });
    const facts = { user: frank, weather: good };
    rools.register(brokenRule, ruleMoodGreat, ruleMoodSad, ruleGoWalking, ruleStayAtHome);
    expect(() => rools.evaluate(facts)).to.not.throw();
    expect(facts.user.mood).to.be.equal('great');
    expect(facts.goWalking).to.be.equal(true);
  });
});
