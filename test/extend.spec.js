const { Rools, Rule } = require('..');
require('./setup');

describe('Rools.evaluate() / extend', () => {
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
    extend: rule2,
    when: (facts) => facts.fact3,
    then: () => { sequence.push(3); },
  });
  const rule4 = new Rule({
    name: 'rule4',
    extend: rule2,
    when: (facts) => facts.fact4,
    then: () => { sequence.push(4); },
  });
  const rule5 = new Rule({
    name: 'rule5',
    extend: [rule3, rule4],
    when: (facts) => facts.fact5,
    then: () => { sequence.push(5); },
  });
  const facts = {
    fact1: true,
    fact2: true,
    fact3: true,
    fact4: true,
    fact5: true,
  };

  it('should fire rule with higher specificity first / 1 extended rule', async () => {
    sequence.length = 0; // reset
    const rools = new Rools();
    await rools.register([rule1, rule2]);
    await rools.evaluate(facts);
    expect(sequence).to.be.deep.equal([2, 1]);
  });

  it('should fire rule with higher specificity first / 2 extended rules', async () => {
    sequence.length = 0; // reset
    const rools = new Rools();
    await rools.register([rule1, rule2, rule3]);
    await rools.evaluate(facts);
    expect(sequence).to.be.deep.equal([3, 2, 1]);
  });

  it('should fire rule with higher specificity, then order of registration / 3 extended rules', async () => {
    sequence.length = 0; // reset
    const rools = new Rools();
    await rools.register([rule1, rule2, rule3, rule4]);
    await rools.evaluate(facts);
    expect(sequence).to.be.deep.equal([3, 4, 2, 1]);
  });

  it('should fire rule with highest prio, then higher specificity / 2 extended rules / 1', async () => {
    sequence.length = 0; // reset
    const rools = new Rools();
    await rools.register([new Rule({ ...rule1, priority: 10 }), rule2, rule3]);
    await rools.evaluate(facts);
    expect(sequence).to.be.deep.equal([1, 3, 2]);
  });

  it('should fire rule with highest prio, then higher specificity / 2 extended rules / 2', async () => {
    sequence.length = 0; // reset
    const rools = new Rools();
    await rools.register([rule1, new Rule({ ...rule2, priority: 10 }), rule3]);
    await rools.evaluate(facts);
    expect(sequence).to.be.deep.equal([2, 3, 1]);
  });

  it('should fire rule with highest prio, then higher specificity / 3 extended rules', async () => {
    sequence.length = 0; // reset
    const rools = new Rools();
    await rools.register([rule1, rule2, rule3, new Rule({ ...rule4, priority: 10 })]);
    await rools.evaluate(facts);
    expect(sequence).to.be.deep.equal([4, 3, 2, 1]);
  });

  it('should fire rule with highest specificity, then order of registration / 4 extended rules', async () => {
    sequence.length = 0; // reset
    const rools = new Rools();
    await rools.register([rule1, rule2, rule3, rule4, rule5]);
    await rools.evaluate(facts);
    expect(sequence).to.be.deep.equal([5, 3, 4, 2, 1]);
  });
});
