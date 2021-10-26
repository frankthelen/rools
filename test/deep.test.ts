import { Rools } from '../src';
import { frank, michael } from './facts/users';
import { good, bad } from './facts/weather';
import {
  ruleTeamMoodGreat, ruleTeamGoWalking, ruleTeamStayAtHome,
} from './rules/deep';

describe('Rools.evaluate() / deep facts + array', () => {
  let rools: Rools;

  beforeAll(async () => {
    rools = new Rools();
    await rools.register([ruleTeamMoodGreat, ruleTeamGoWalking, ruleTeamStayAtHome]);
  });

  it('should evaluate scenario 1', async () => {
    const facts = { team: { members: [frank(), michael()] }, weather: good() };
    await rools.evaluate(facts);
    // @ts-ignore
    expect(facts.team.mood).toEqual('great');
    // @ts-ignore
    expect(facts.team.goWalking).toEqual(true);
  });

  it('should evaluate scenario 2', async () => {
    const facts = { team: { members: [frank(), michael()] }, weather: bad() };
    await rools.evaluate(facts);
    // @ts-ignore
    expect(facts.team.mood).toEqual('great');
    // @ts-ignore
    expect(facts.team.stayAtHome).toEqual(true);
  });
});
