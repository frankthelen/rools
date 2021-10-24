import { Rools } from '../src';
import { frank, michael } from './facts/users';
import { good, bad } from './facts/weather';
import {
  ruleMoodGreat, ruleMoodSad, ruleGoWalking, ruleStayAtHome,
} from './rules/mood';

describe('Rools.evaluate() / simple', () => {
  let rools: Rools;

  beforeAll(async () => {
    rools = new Rools();
    await rools.register([ruleMoodGreat, ruleMoodSad, ruleGoWalking, ruleStayAtHome]);
  });

  it('should evaluate scenario 1', async () => {
    const facts: any = { user: frank(), weather: good() };
    await rools.evaluate(facts);
    expect(facts.user.mood).toEqual('great');
    expect(facts.goWalking).toEqual(true);
    expect(facts.stayAtHome).toEqual(undefined);
  });

  it('should evaluate scenario 2', async () => {
    const facts: any = { user: michael(), weather: good() };
    await rools.evaluate(facts);
    expect(facts.user.mood).toEqual('sad');
    expect(facts.goWalking).toEqual(undefined);
    expect(facts.stayAtHome).toEqual(true);
  });

  it('should evaluate scenario 3', async () => {
    const facts: any = { user: frank(), weather: bad() };
    await rools.evaluate(facts);
    expect(facts.user.mood).toEqual('great');
    expect(facts.goWalking).toEqual(undefined);
    expect(facts.stayAtHome).toEqual(true);
  });
});
