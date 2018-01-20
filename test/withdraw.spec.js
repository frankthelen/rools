const Rools = require('..');
require('./setup');

describe('Rules.evaluate() / withdraw', () => {
  const spy = sinon.spy();

  const rule1 = {
    name: 'rule1',
    when: facts => facts.fact1,
    then: (facts) => { facts.fact2 = false; },
  };

  const rule2 = {
    name: 'rule2',
    when: facts => facts.fact2,
    then: () => { spy(); },
  };

  const facts = {
    fact1: true,
    fact2: true,
  };

  it('should withdraw action from agenda (un-ready) if facts were changed by previous action', async () => {
    const rools = new Rools();
    await rools.register([rule1, rule2]);
    await rools.evaluate(facts);
    expect(spy.called).to.be.equal(false);
  });
});
