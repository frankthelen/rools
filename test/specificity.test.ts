import { Rools, Rule } from '../src';

describe('Rools.evaluate() / specificity', () => {
  const sequence: number[] = [];
  const rule1 = new Rule({
    name: 'rule1',
    when: (facts) => facts.fact1 as boolean,
    then: () => { sequence.push(1); },
  });
  const rule2 = new Rule({
    name: 'rule2',
    when: [
      (facts) => facts.fact1 as boolean,
      (facts) => facts.fact2 as boolean,
    ],
    then: () => { sequence.push(2); },
  });
  const rule3 = new Rule({
    name: 'rule3',
    when: [
      (facts) => facts.fact1 as boolean,
      (facts) => facts.fact2 as boolean,
      (facts) => facts.fact3 as boolean,
    ],
    then: () => { sequence.push(3); },
  });
  const rule4 = new Rule({
    name: 'rule4',
    when: [
      (facts) => facts.fact1 as boolean,
      (facts) => facts.fact2 as boolean,
      (facts) => facts.fact4 as boolean,
    ],
    then: () => { sequence.push(4); },
  });
  const facts = {
    fact1: true,
    fact2: true,
    fact3: true,
    fact4: true,
  };

  it('should fire rule with higher specificity first', async () => {
    sequence.length = 0; // reset
    const rools = new Rools();
    await rools.register([rule1, rule2]);
    await rools.evaluate(facts);
    expect(sequence).toEqual([2, 1]);
  });

  it('should fire rule with higher specificity first / three levels', async () => {
    sequence.length = 0; // reset
    const rools = new Rools();
    await rools.register([rule1, rule2, rule3]);
    await rools.evaluate(facts);
    expect(sequence).toEqual([3, 2, 1]);
  });

  it('should fire rule with higher specificity, then order of registration', async () => {
    sequence.length = 0; // reset
    const rools = new Rools();
    await rools.register([rule1, rule2, rule3, rule4]);
    await rools.evaluate(facts);
    expect(sequence).toEqual([3, 4, 2, 1]);
  });

  it('should fire rule with highest prio, then higher specificity', async () => {
    sequence.length = 0; // reset
    const rools = new Rools();
    await rools.register([new Rule({ ...rule1, priority: 10 }), rule2, rule3]);
    await rools.evaluate(facts);
    expect(sequence).toEqual([1, 3, 2]);
  });

  it('should fire rule with highest prio, then higher specificity / 2', async () => {
    sequence.length = 0; // reset
    const rools = new Rools();
    await rools.register([rule1, new Rule({ ...rule2, priority: 10 }), rule3]);
    await rools.evaluate(facts);
    expect(sequence).toEqual([2, 3, 1]);
  });

  it('should fire rule with highest prio, then higher specificity / 3', async () => {
    sequence.length = 0; // reset
    const rools = new Rools();
    await rools.register([rule1, rule2, rule3, new Rule({ ...rule4, priority: 10 })]);
    await rools.evaluate(facts);
    expect(sequence).toEqual([4, 3, 2, 1]);
  });
});