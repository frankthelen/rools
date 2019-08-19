const { Rools, Rule } = require('..');
require('./setup');

describe('Rools.evaluate() / activation group', () => {
  const sequence = [];
  const rule1 = new Rule({
    name: 'rule1',
    when: (facts) => facts.fact1,
    then: () => { sequence.push(1); },
  });
  const rule2 = new Rule({
    name: 'rule2',
    extend: rule1,
    when: (facts) => facts.fact2,
    then: () => { sequence.push(2); },
  });
  const rule3 = new Rule({
    name: 'rule3',
    extens: rule2,
    activationGroup: 'groupX',
    when: (facts) => facts.fact3,
    then: () => { sequence.push(3); },
  });
  const rule4 = new Rule({
    name: 'rule4',
    extend: rule2,
    activationGroup: 'groupX',
    when: (facts) => facts.fact4,
    then: () => { sequence.push(4); },
  });
  const facts = {
    fact1: true,
    fact2: true,
    fact3: true,
    fact4: true,
  };

  it('should fire only one rule in activation group', async () => {
    sequence.length = 0; // reset
    const rools = new Rools();
    await rools.register([
      rule1,
      rule2,
      rule3,
      rule4,
    ]);
    await rools.evaluate(facts);
    expect(sequence).to.be.deep.equal([3, 2, 1]);
  });

  it('should fire only one rule in activation group / priority', async () => {
    sequence.length = 0; // reset
    const rools = new Rools();
    await rools.register([
      rule1,
      rule2,
      rule3,
      new Rule({ ...rule4, priority: 10 }),
    ]);
    await rools.evaluate(facts);
    expect(sequence).to.be.deep.equal([4, 2, 1]);
  });

  it('should fire only one rule in activation group / specificity', async () => {
    sequence.length = 0; // reset
    const rools = new Rools();
    await rools.register([
      new Rule({ ...rule1, priority: 10 }),
      new Rule({ ...rule2, priority: 5 }),
      rule3,
      rule4,
    ]);
    await rools.evaluate(facts, { strategy: 'sp' });
    expect(sequence).to.be.deep.equal([3, 2, 1]);
  });

  it('should fire only one rule in activation group / specificity 2', async () => {
    sequence.length = 0; // reset
    const rools = new Rools();
    await rools.register([
      new Rule({ ...rule1, priority: 10 }),
      new Rule({ ...rule2, priority: 5 }),
      rule3,
      new Rule({ ...rule4, priority: 2 }),
    ]);
    await rools.evaluate(facts, { strategy: 'sp' });
    expect(sequence).to.be.deep.equal([4, 2, 1]);
  });
});
