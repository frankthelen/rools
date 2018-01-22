const { Rools, Rule } = require('..');
require('./setup');

describe('Rools.evaluate() / re-evaluate', () => {
  it('should re-evaluate premises only if facts are changed / row', async () => {
    const premisesEvaluated = [];
    const actionsFired = [];
    const rule1 = new Rule({
      name: 'rule1',
      when: (facts) => { premisesEvaluated.push(1); return facts.fact1; },
      then: (facts) => { actionsFired.push(1); facts.fact2 = true; },
    });
    const rule2 = new Rule({
      name: 'rule2',
      when: (facts) => { premisesEvaluated.push(2); return facts.fact2; },
      then: (facts) => { actionsFired.push(2); facts.fact3 = true; },
    });
    const rule3 = new Rule({
      name: 'rule3',
      when: (facts) => { premisesEvaluated.push(3); return facts.fact3; },
      then: () => { actionsFired.push(3); },
    });
    const facts = {
      fact1: true,
      fact2: false,
      fact3: false,
    };
    const rools = new Rools();
    await rools.register([rule1, rule2, rule3]);
    await rools.evaluate(facts);
    expect(premisesEvaluated).to.be.deep.equal([1, 2, 3, 2, 3]);
    expect(actionsFired).to.be.deep.equal([1, 2, 3]);
  });

  it('should re-evaluate premises only if facts are changed / complex', async () => {
    const premisesEvaluated = [];
    const actionsFired = [];
    const rule1 = new Rule({
      name: 'rule1',
      when: (facts) => { premisesEvaluated.push(1); return facts.fact1; },
      then: (facts) => { actionsFired.push(1); facts.fact2 = true; },
    });
    const rule2 = new Rule({
      name: 'rule2',
      when: (facts) => { premisesEvaluated.push(2); return facts.fact2; },
      then: (facts) => { actionsFired.push(2); facts.fact1 = false; facts.fact3 = true; },
    });
    const rule3 = new Rule({
      name: 'rule3',
      when: (facts) => { premisesEvaluated.push(3); return facts.fact3; },
      then: (facts) => { actionsFired.push(3); facts.fact2 = false; },
    });
    const facts = {
      fact1: true,
      fact2: false,
      fact3: false,
    };
    const rools = new Rools();
    await rools.register([rule1, rule2, rule3]);
    await rools.evaluate(facts);
    expect(premisesEvaluated).to.be.deep.equal([1, 2, 3, 2, 1, 3, 2]);
    expect(actionsFired).to.be.deep.equal([1, 2, 3]);
  });
});
