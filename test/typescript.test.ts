import { Rools, Rule } from '../src';

describe('Integration TypeScript', () => {
  it('should work', async () => {
    const facts: any = {
      foo: false,
      bar: true,
    };
    const rools = new Rools();
    const rule = new Rule({
      name: 'rule',
      when: () => {
        return true;
      },
      then: (f: any) => {
        f.foo = true;
      },
    });
    await rools.register([rule]);
    await rools.evaluate(facts);
    expect(facts.foo).toEqual(true);
  });
});
