import { strict as assert } from 'assert';
import { Rools, Rule } from '../src';
import { frank } from './facts/users';
import { good } from './facts/weather';
import {
  ruleMoodGreat, ruleMoodSad, ruleGoWalking, ruleStayAtHome,
} from './rules/mood';

interface Facts {
  user: any;
  weather: any;
  goWalking?: any;
}

describe('Rools.evaluate() / errors', () => {
  it('should not fail if `when` throws error', async () => {
    const brokenRule = new Rule({
      name: 'broken rule #1',
      // @ts-ignore
      when: (facts: Facts) => facts.bla.blub === 'blub', // TypeError: Cannot read property 'blub' of undefined
      then: () => {},
    });
    const rools = new Rools({ logging: { error: false } });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const facts: Facts = { user: frank(), weather: good() };
    await rools.register([brokenRule, ruleMoodGreat, ruleMoodSad, ruleGoWalking, ruleStayAtHome]);
    try {
      await rools.evaluate(facts);
    } catch (error) {
      assert.fail();
    }
    expect(facts.user.mood).toEqual('great');
    expect(facts.goWalking).toEqual(true);
  });

  it('should fail if `then` throws error', async () => {
    const brokenRule = new Rule({
      name: 'broken rule #2',
      when: () => true, // fire immediately
      then: (facts: Facts) => {
        // @ts-ignore
        facts.bla.blub = 'blub'; // TypeError: Cannot read property 'blub' of undefined
      },
    });
    const rools = new Rools({ logging: { error: false } });
    const facts = { user: frank(), weather: good() };
    await rools.register([brokenRule, ruleMoodGreat, ruleMoodSad, ruleGoWalking, ruleStayAtHome]);
    try {
      await rools.evaluate(facts);
      assert.fail();
    } catch (error) {
      // ignore
    }
  });
});
