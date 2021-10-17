const { Rools, Rule } = require('../src');
require('./setup');

describe('Rools.evaluate() / facts with symbol properties', () => {
  let rools;

  before(async () => {
    rools = new Rools();
    const foo = Symbol.for('foo');
    const rule1 = new Rule({
      name: 'symbol test rule 1',
      when: (facts) => facts[foo].bar,
      then: (facts) => {
        facts[foo].baz = 'great';
      },
    });
    const rule2 = new Rule({
      name: 'symbol test rule 2',
      when: (facts) => facts[foo].baz === 'great',
      then: (facts) => {
        facts[foo].qux = 'great';
      },
    });
    await rools.register([rule1, rule2]);
  });

  it('should evaluate rules', async () => {
    const foo = Symbol.for('foo');
    const facts = {
      [foo]: {
        bar: true,
        quux: false,
      },
    };
    const { updated, fired } = await rools.evaluate(facts);
    expect(facts).to.be.deep.equal({
      [foo]: {
        bar: true,
        quux: false,
        baz: 'great',
        qux: 'great',
      },
    });
    expect(updated).to.be.deep.equal([foo]);
    expect(fired).to.be.equal(2);
  });
});
