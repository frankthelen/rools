import { Rools, Rule } from '../src';
import { frank } from './facts/users';
import { good } from './facts/weather';
import {
  ruleMoodGreat, ruleMoodSad, ruleGoWalking, ruleStayAtHome,
} from './rules/mood';

describe('Rools.evaluate() / delegate logging', () => {
  it('should log debug', async () => {
    let counter = 0;
    const spy = () => {
      counter += 1;
    };
    const rools = new Rools({ logging: { error: false, debug: true, delegate: spy } });
    await rools.register([ruleMoodGreat, ruleMoodSad, ruleGoWalking, ruleStayAtHome]);
    await rools.evaluate({ user: frank(), weather: good() });
    expect(counter).not.toEqual(0);
  });

  it('should log errors', async () => {
    const brokenRule = new Rule({
      name: 'broken rule #2',
      when: () => true, // fire immediately
      then: (facts) => {
        facts.bla.blub = 'blub'; // TypeError: Cannot read property 'blub' of undefined
      },
    });
    let counter = 0;
    const spy = () => {
      counter += 1;
    };
    const rools = new Rools({ logging: { error: true, debug: false, delegate: spy } });
    await rools.register([brokenRule, ruleMoodGreat, ruleMoodSad, ruleGoWalking, ruleStayAtHome]);
    try {
      await rools.evaluate({ user: frank(), weather: good() });
    } catch (error) {
      // ignore
    }
    expect(counter).not.toEqual(0);
  });

  it('should log errors by default', async () => {
    const brokenRule = new Rule({
      name: 'broken rule #2',
      when: () => true, // fire immediately
      then: (facts) => {
        facts.bla.blub = 'blub'; // TypeError: Cannot read property 'blub' of undefined
      },
    });
    let counter = 0;
    const spy = () => {
      counter += 1;
    };
    const rools = new Rools({ logging: { delegate: spy } });
    await rools.register([brokenRule, ruleMoodGreat, ruleMoodSad, ruleGoWalking, ruleStayAtHome]);
    try {
      await rools.evaluate({ user: frank(), weather: good() });
    } catch (error) {
      // ignore
    }
    expect(counter).not.toEqual(0);
  });
});

describe('Rools.evaluate() / console logging', () => {
  let consoleLogMock: jest.SpyInstance;
  let consoleErrorMock: jest.SpyInstance;

  beforeEach(() => {
    consoleLogMock = jest.spyOn(global.console, 'log').mockImplementation();
    consoleErrorMock = jest.spyOn(global.console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleLogMock.mockRestore();
    consoleErrorMock.mockRestore();
  });

  it('should log debug', async () => {
    const rools = new Rools({ logging: { error: false, debug: true } });
    await rools.register([ruleMoodGreat, ruleMoodSad, ruleGoWalking, ruleStayAtHome]);
    await rools.evaluate({ user: frank(), weather: good() });
    expect(console.log).toHaveBeenCalled();
  });

  it('should log errors', async () => {
    const brokenRule = new Rule({
      name: 'broken rule #2',
      when: () => true, // fire immediately
      then: (facts) => {
        facts.bla.blub = 'blub'; // TypeError: Cannot read property 'blub' of undefined
      },
    });
    const rools = new Rools({ logging: { error: true, debug: false } });
    await rools.register([brokenRule, ruleMoodGreat, ruleMoodSad, ruleGoWalking, ruleStayAtHome]);
    try {
      await rools.evaluate({ user: frank(), weather: good() });
    } catch (error) {
      // ignore
    }
    expect(consoleErrorMock).toHaveBeenCalled();
  });

  it('should log errors by default / 1', async () => {
    const brokenRule = new Rule({
      name: 'broken rule #2',
      when: () => true, // fire immediately
      then: (facts) => {
        facts.bla.blub = 'blub'; // TypeError: Cannot read property 'blub' of undefined
      },
    });
    const rools = new Rools();
    await rools.register([brokenRule, ruleMoodGreat, ruleMoodSad, ruleGoWalking, ruleStayAtHome]);
    try {
      await rools.evaluate({ user: frank(), weather: good() });
    } catch (error) {
      // ignore
    }
    expect(consoleErrorMock).toHaveBeenCalled();
  });

  it('should log errors by default / 2', async () => {
    const brokenRule = new Rule({
      name: 'broken rule #2',
      when: () => true, // fire immediately
      then: (facts) => {
        facts.bla.blub = 'blub'; // TypeError: Cannot read property 'blub' of undefined
      },
    });
    const rools = new Rools({});
    await rools.register([brokenRule, ruleMoodGreat, ruleMoodSad, ruleGoWalking, ruleStayAtHome]);
    try {
      await rools.evaluate({ user: frank(), weather: good() });
    } catch (error) {
      // ignore
    }
    expect(consoleErrorMock).toHaveBeenCalled();
  });
});
