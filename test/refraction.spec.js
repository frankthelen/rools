const Rools = require('..');
require('./setup');

describe('Rules.evaluate() / refraction', () => {
  const spy = sinon.spy();

  const rule1 = {
    name: 'rule1',
    when: facts => facts.fact1,
    then: (facts) => { facts.fact1 = false; facts.fact1 = true; spy(); },
    priority: 10,
  };

  const rule2 = {
    name: 'rule2',
    when: facts => facts.fact2,
    then: (facts) => { facts.fact1 = false; facts.fact1 = true; },
  };

  const facts = {
    fact1: true,
    fact2: true,
  };

  it('should fire each rule only once / recursive', async () => {
    spy.resetHistory();
    const rools = new Rools();
    await rools.register(rule1);
    await rools.evaluate(facts);
    expect(spy.calledOnce).to.be.equal(true);
  });

  it('should fire each rule only once / transitive', async () => {
    spy.resetHistory();
    const rools = new Rools();
    await rools.register(rule1, rule2);
    await rools.evaluate(facts);
    expect(spy.calledOnce).to.be.equal(true);
  });
});
