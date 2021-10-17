const { Rools, Rule } = require('../src');
require('./setup');

describe('Rools.evaluate() / cycle', () => {
  let rools;

  before(async () => {
    rools = new Rools();
    const rule1 = new Rule({
      name: 'rule 1',
      when: (facts) => facts.foo,
      then: (facts) => {
        facts.foo = false;
      },
    });
    const rule2 = new Rule({
      name: 'rule 2',
      when: (facts) => !facts.foo,
      then: (facts) => {
        facts.foo = true;
      },
    });
    await rools.register([rule1, rule2]);
  });

  it('should evaluate without cycle / scenario 1', async () => {
    const facts = {
      foo: true,
    };
    const result = await rools.evaluate(facts);
    expect(facts).to.be.deep.equal({ foo: true });
    expect(result.fired).to.be.equal(2);
  });

  it('should evaluate without cycle / scenario 2', async () => {
    const facts = {
      foo: false,
    };
    const result = await rools.evaluate(facts);
    expect(facts).to.be.deep.equal({ foo: false });
    expect(result.fired).to.be.equal(2);
  });
});
