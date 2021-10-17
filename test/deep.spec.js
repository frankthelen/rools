const { Rools } = require('../src');
const { frank, michael } = require('./facts/users')();
const { good, bad } = require('./facts/weather')();
const {
  ruleTeamMoodGreat, ruleTeamGoWalking, ruleTeamStayAtHome,
} = require('./rules/deep');
require('./setup');

describe('Rools.evaluate() / deep facts + array', () => {
  let rools;

  before(async () => {
    rools = new Rools();
    await rools.register([ruleTeamMoodGreat, ruleTeamGoWalking, ruleTeamStayAtHome]);
  });

  it('should evaluate scenario 1', async () => {
    const facts = { team: { members: [frank, michael] }, weather: good };
    await rools.evaluate(facts);
    expect(facts.team.mood).to.be.equal('great');
    expect(facts.team.goWalking).to.be.equal(true);
  });

  it('should evaluate scenario 2', async () => {
    const facts = { team: { members: [frank, michael] }, weather: bad };
    await rools.evaluate(facts);
    expect(facts.team.mood).to.be.equal('great');
    expect(facts.team.stayAtHome).to.be.equal(true);
  });
});
