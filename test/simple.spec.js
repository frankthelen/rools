const Rools = require('../src');
const { frank, michael } = require('./facts/users')();
const { good, bad } = require('./facts/weather')();
const {
  ruleMoodGreat, ruleMoodSad, ruleGoWalking, ruleStayAtHome,
} = require('./rules/mood');
require('./setup');

describe('Rules.evaluate() / simple scenarios', () => {
  let rools;

  before(() => {
    rools = new Rools();
    rools.register(ruleMoodGreat, ruleMoodSad, ruleGoWalking, ruleStayAtHome);
  });

  it('Test 1', async () => {
    const result = await rools.evaluate({ user: frank, weather: good });
    // console.log(result); // eslint-disable-line no-console
    expect(result.user.mood).to.be.equal('great');
    expect(result.goWalking).to.be.equal(true);
    expect(result.stayAtHome).to.be.equal(undefined);
  });

  it('Test 2', async () => {
    const result = await rools.evaluate({ user: michael, weather: good });
    // console.log(result); // eslint-disable-line no-console
    expect(result.user.mood).to.be.equal('sad');
    expect(result.goWalking).to.be.equal(undefined);
    expect(result.stayAtHome).to.be.equal(true);
  });

  it('Test 3', async () => {
    const result = await rools.evaluate({ user: frank, weather: bad });
    // console.log(result); // eslint-disable-line no-console
    expect(result.user.mood).to.be.equal('great');
    expect(result.goWalking).to.be.equal(undefined);
    expect(result.stayAtHome).to.be.equal(true);
  });
});
