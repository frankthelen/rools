const Rools = require('../src');
const { frank } = require('./facts/users')();
const { good } = require('./facts/weather')();
const {
  ruleMoodGreat, ruleMoodSad, ruleGoWalking, ruleStayAtHome,
} = require('./rules/mood');
require('./setup');

describe('Rules.evaluate() / final rule', () => {
  let rools;

  before(() => {
    rools = new Rools();
    rools.register(
      ruleGoWalking,
      ruleStayAtHome,
      { ...ruleMoodGreat, final: true },
      { ...ruleMoodSad, final: true },
    );
  });

  it('should terminate after final rule', async () => {
    const result = await rools.evaluate({ user: frank, weather: good });
    expect(result.user.mood).to.be.equal('great');
    expect(result.goWalking).to.be.equal(undefined);
    expect(result.stayAtHome).to.be.equal(undefined);
  });
});
