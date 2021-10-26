import { Rools, Rule } from '../src';

describe('Rools.evaluate() / refraction', () => {
  const spy = jest.fn();

  const rule1 = new Rule({
    name: 'rule1',
    when: (facts) => facts.fact1 as boolean,
    then: (facts) => { facts.fact1 = false; facts.fact1 = true; spy(); },
    priority: 10,
  });

  const rule2 = new Rule({
    name: 'rule2',
    when: (facts) => facts.fact2 as boolean,
    then: (facts) => { facts.fact1 = false; facts.fact1 = true; },
  });

  const facts = {
    fact1: true,
    fact2: true,
  };

  it('should fire each rule only once / recursive', async () => {
    spy.mockClear();
    const rools = new Rools();
    await rools.register([rule1]);
    await rools.evaluate(facts);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should fire each rule only once / transitive', async () => {
    spy.mockClear();
    const rools = new Rools();
    await rools.register([rule1, rule2]);
    await rools.evaluate(facts);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
