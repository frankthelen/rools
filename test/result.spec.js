const { Rools } = require('..');
const { frank } = require('./facts/users')();
const { good } = require('./facts/weather')();
const {
  ruleMoodGreat, ruleMoodSad, ruleGoWalking, ruleStayAtHome,
} = require('./rules/mood');
require('./setup');

describe('Rools.evaluate() / result', () => {
  let rools;

  before(async () => {
    rools = new Rools();
    await rools.register([ruleMoodGreat, ruleMoodSad, ruleGoWalking, ruleStayAtHome]);
  });

  it('should return evaluation details', async () => {
    const facts = { user: frank, weather: good };
    const result = await rools.evaluate(facts);
    expect(result).to.have.property('updated');
    expect(result).to.have.property('accessedByActions');
    expect(result).to.have.property('accessedByPremises');
    expect(result).to.have.property('fired');
    expect(result).to.have.property('elapsed');
    expect(result.updated).to.be.deep.equal(['user', 'goWalking']);
    expect(result.accessedByActions).to.be.deep.equal(['user', 'goWalking']);
    expect(result.accessedByPremises).to.be.deep.equal(['user', 'weather']);
    expect(result.fired).to.be.equal(2);
    expect(result.elapsed).to.be.gte(0);
  });
});
