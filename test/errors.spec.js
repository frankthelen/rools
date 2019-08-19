const assert = require('assert');
const { Rools, Rule } = require('..');
const { frank } = require('./facts/users')();
const { good } = require('./facts/weather')();
const {
  ruleMoodGreat, ruleMoodSad, ruleGoWalking, ruleStayAtHome,
} = require('./rules/mood');
require('./setup');

describe('Rools.evaluate() / errors', () => {
  it('should not fail if `when` throws error', async () => {
    const brokenRule = new Rule({
      name: 'broken rule #1',
      when: (facts) => facts.bla.blub === 'blub', // TypeError: Cannot read property 'blub' of undefined
      then: () => {},
    });
    const rools = new Rools({ logging: { error: false } });
    const facts = { user: frank, weather: good };
    await rools.register([brokenRule, ruleMoodGreat, ruleMoodSad, ruleGoWalking, ruleStayAtHome]);
    try {
      await rools.evaluate(facts);
    } catch (error) {
      assert.fail();
    }
    expect(facts.user.mood).to.be.equal('great');
    expect(facts.goWalking).to.be.equal(true);
  });

  it('should fail if `then` throws error', async () => {
    const brokenRule = new Rule({
      name: 'broken rule #2',
      when: () => true, // fire immediately
      then: (facts) => {
        facts.bla.blub = 'blub'; // TypeError: Cannot read property 'blub' of undefined
      },
    });
    const rools = new Rools({ logging: { error: false } });
    const facts = { user: frank, weather: good };
    await rools.register([brokenRule, ruleMoodGreat, ruleMoodSad, ruleGoWalking, ruleStayAtHome]);
    try {
      await rools.evaluate(facts);
      assert.fail();
    } catch (error) {
      // ignore
    }
  });
});
