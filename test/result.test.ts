import { Rools } from '../src';
import { frank } from './facts/users';
import { good } from './facts/weather';
import {
  ruleMoodGreat, ruleMoodSad, ruleGoWalking, ruleStayAtHome,
} from './rules/mood';

describe('Rools.evaluate() / result', () => {
  let rools: Rools;

  beforeAll(async () => {
    rools = new Rools();
    await rools.register([ruleMoodGreat, ruleMoodSad, ruleGoWalking, ruleStayAtHome]);
  });

  it('should return evaluation details', async () => {
    const facts = { user: frank(), weather: good() };
    const result = await rools.evaluate(facts);
    expect(result).toHaveProperty('updated');
    expect(result).toHaveProperty('accessedByActions');
    expect(result).toHaveProperty('accessedByPremises');
    expect(result).toHaveProperty('fired');
    expect(result).toHaveProperty('elapsed');
    expect(result.updated).toEqual(['user', 'goWalking']);
    expect(result.accessedByActions).toEqual(['user', 'goWalking']);
    expect(result.accessedByPremises).toEqual(['user', 'weather']);
    expect(result.fired).toEqual(2);
    expect(result.elapsed).toBeGreaterThanOrEqual(0);
  });
});
