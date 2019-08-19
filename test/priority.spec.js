const { Rools, Rule } = require('..');
require('./setup');

describe('Rools.evaluate() / priority', () => {
  const sequence = [];

  const rule1 = new Rule({
    name: 'rule1',
    when: (facts) => facts.fact1,
    then: () => { sequence.push(1); },
  });

  const rule2 = new Rule({
    name: 'rule2',
    when: (facts) => facts.fact1,
    then: () => { sequence.push(2); },
  });

  const rule3 = new Rule({
    name: 'rule3',
    when: (facts) => facts.fact1,
    then: () => { sequence.push(3); },
  });

  const facts = {
    fact1: true,
  };

  it('should fire priority 10 first, then in order of registration', async () => {
    sequence.length = 0;
    const rools = new Rools();
    await rools.register([
      rule1,
      new Rule({ ...rule2, priority: 10 }),
      rule3,
    ]);
    await rools.evaluate(facts);
    expect(sequence).to.be.deep.equal([2, 1, 3]);
  });

  it('should fire in order of registration, finally negative priority -10', async () => {
    sequence.length = 0;
    const rools = new Rools();
    await rools.register([
      new Rule({ ...rule1, priority: -10 }),
      rule2,
      rule3,
    ]);
    await rools.evaluate(facts);
    expect(sequence).to.be.deep.equal([2, 3, 1]);
  });

  it('should fire in order of priority 10, 0, -10', async () => {
    sequence.length = 0;
    const rools = new Rools();
    await rools.register([
      new Rule({ ...rule1, priority: -10 }),
      rule2,
      new Rule({ ...rule3, priority: 10 }),
    ]);
    await rools.evaluate(facts);
    expect(sequence).to.be.deep.equal([3, 2, 1]);
  });

  it('should fire in order of registration if equal priorities', async () => {
    sequence.length = 0;
    const rools = new Rools();
    await rools.register([
      new Rule({ ...rule1, priority: 10 }),
      new Rule({ ...rule2, priority: 10 }),
      new Rule({ ...rule3, priority: 10 }),
    ]);
    await rools.evaluate(facts);
    expect(sequence).to.be.deep.equal([1, 2, 3]);
  });
});
