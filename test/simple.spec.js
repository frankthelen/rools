const { Rools } = require('..');
const { frank, michael } = require('./facts/users')();
const { good, bad } = require('./facts/weather')();
const {
  ruleMoodGreat, ruleMoodSad, ruleGoWalking, ruleStayAtHome,
} = require('./rules/mood');
require('./setup');

describe('Rools.evaluate() / simple', () => {
  let rools;

  before(async () => {
    rools = new Rools();
    await rools.register([ruleMoodGreat, ruleMoodSad, ruleGoWalking, ruleStayAtHome]);
  });

  it('should evaluate scenario 1', async () => {
    const facts = { user: frank, weather: good };
    await rools.evaluate(facts);
    expect(facts.user.mood).to.be.equal('great');
    expect(facts.goWalking).to.be.equal(true);
    expect(facts.stayAtHome).to.be.equal(undefined);
  });

  it('should evaluate scenario 2', async () => {
    const facts = { user: michael, weather: good };
    await rools.evaluate(facts);
    expect(facts.user.mood).to.be.equal('sad');
    expect(facts.goWalking).to.be.equal(undefined);
    expect(facts.stayAtHome).to.be.equal(true);
  });

  it('should evaluate scenario 3', async () => {
    const facts = { user: frank, weather: bad };
    await rools.evaluate(facts);
    expect(facts.user.mood).to.be.equal('great');
    expect(facts.goWalking).to.be.equal(undefined);
    expect(facts.stayAtHome).to.be.equal(true);
  });
});
