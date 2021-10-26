import { Rools } from '../src';
import { frank } from './facts/users';
import { rule1, rule2 } from './rules/availability';

describe('Rools.evaluate() / async', () => {
  it('should call async action / action with async/await', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const facts = { user: frank() };
    const rools = new Rools();
    await rools.register([rule1]);
    await rools.evaluate(facts);
    // @ts-ignore
    expect(facts.products).toEqual(['dsl', 'm4g', 'm3g']);
  });

  it('should call async action / action with promises', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const facts = { user: frank() };
    const rools = new Rools();
    await rools.register([rule2]);
    await rools.evaluate(facts);
    // @ts-ignore
    expect(facts.products).toEqual(['dsl', 'm4g', 'm3g']);
  });
});
