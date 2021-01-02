import 'mocha';
import { expect } from 'chai';
import { Rools, Rule } from "../..";

describe('Integration TypeScript', () => {
  it('should work', async () => {
    const facts: any = {
      foo: false,
      bar: true,
    };
    const rools = new Rools();
    const rule = new Rule({
      name: 'rule',
      when: (facts: any) => {
        return true
      },
      then: (facts: any) => {
        facts.foo = true;
      },
    });
    await rools.register([rule]);
    await rools.evaluate(facts);
    expect(facts.foo).to.be.equal(true);
  });
});
