import { Rools, Rule } from '../src';
import { frank } from './facts/users';
import { good } from './facts/weather';
import {
  ruleMoodGreat, ruleMoodSad, ruleGoWalking, ruleStayAtHome,
} from './rules/mood';

describe('Rools.evaluate() / final', () => {
  let rools: Rools;

  beforeAll(async () => {
    rools = new Rools();
    await rools.register([
      ruleGoWalking,
      ruleStayAtHome,
      new Rule({ ...ruleMoodGreat, final: true }),
      new Rule({ ...ruleMoodSad, final: true }),
    ]);
  });

  it('should terminate after final rule', async () => {
    const facts: any = { user: frank(), weather: good() };
    await rools.evaluate(facts);
    expect(facts.user.mood).toEqual('great');
    expect(facts.goWalking).toEqual(undefined);
    expect(facts.stayAtHome).toEqual(undefined);
  });
});
