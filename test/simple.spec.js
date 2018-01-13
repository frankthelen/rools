const Rools = require('..');
const { frank, michael } = require('./facts/users')();
const { good, bad } = require('./facts/weather')();
const {
  ruleMoodGreat, ruleMoodSad, ruleGoWalking, ruleStayAtHome,
} = require('./rules/mood');
require('./setup');

describe('Rules.evaluate() / scenarios', () => {
  let rools;

  before(async () => {
    rools = new Rools();
    await rools.register(ruleMoodGreat, ruleMoodSad, ruleGoWalking, ruleStayAtHome);
  });

  it('should evaluate scenario 1', async () => {
    const result = await rools.evaluate({ user: frank, weather: good });
    expect(result.user.mood).to.be.equal('great');
    expect(result.goWalking).to.be.equal(true);
    expect(result.stayAtHome).to.be.equal(undefined);
  });

  it('should evaluate scenario 2', async () => {
    const result = await rools.evaluate({ user: michael, weather: good });
    expect(result.user.mood).to.be.equal('sad');
    expect(result.goWalking).to.be.equal(undefined);
    expect(result.stayAtHome).to.be.equal(true);
  });

  it('should evaluate scenario 3', async () => {
    const result = await rools.evaluate({ user: frank, weather: bad });
    expect(result.user.mood).to.be.equal('great');
    expect(result.goWalking).to.be.equal(undefined);
    expect(result.stayAtHome).to.be.equal(true);
  });
});
