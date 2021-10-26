import { Rools, Rule } from '../src';

describe('Rools.evaluate() / cycle', () => {
  let rools: Rools;

  beforeAll(async () => {
    rools = new Rools();
    const rule1 = new Rule({
      name: 'rule 1',
      when: (facts: any) => facts.foo as boolean,
      then: (facts: any) => {
        facts.foo = false;
      },
    });
    const rule2 = new Rule({
      name: 'rule 2',
      when: (facts: any) => !facts.foo,
      then: (facts: any) => {
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
    expect(facts).toEqual({ foo: true });
    expect(result.fired).toEqual(2);
  });

  it('should evaluate without cycle / scenario 2', async () => {
    const facts = {
      foo: false,
    };
    const result = await rools.evaluate(facts);
    expect(facts).toEqual({ foo: false });
    expect(result.fired).toEqual(2);
  });
});
