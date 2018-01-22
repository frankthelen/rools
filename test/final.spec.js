const { Rools, Rule } = require('..');
const { frank } = require('./facts/users')();
const { good } = require('./facts/weather')();
const {
  ruleMoodGreat, ruleMoodSad, ruleGoWalking, ruleStayAtHome,
} = require('./rules/mood');
require('./setup');

describe('Rools.evaluate() / final', () => {
  let rools;

  before(async () => {
    rools = new Rools();
    await rools.register([
      ruleGoWalking,
      ruleStayAtHome,
      new Rule({ ...ruleMoodGreat, final: true }),
      new Rule({ ...ruleMoodSad, final: true }),
    ]);
  });

  it('should terminate after final rule', async () => {
    const facts = { user: frank, weather: good };
    await rools.evaluate(facts);
    expect(facts.user.mood).to.be.equal('great');
    expect(facts.goWalking).to.be.equal(undefined);
    expect(facts.stayAtHome).to.be.equal(undefined);
  });
});
