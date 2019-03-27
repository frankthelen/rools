const { Rools, Rule } = require('..');
const { frank } = require('./facts/users')();
const { good } = require('./facts/weather')();
const {
  ruleMoodGreat, ruleMoodSad, ruleGoWalking, ruleStayAtHome,
} = require('./rules/mood');
require('./setup');

describe('Rools.evaluate() / delegate logging', () => {
  it('should log debug', async () => {
    let counter = 0;
    const spy = () => {
      counter += 1;
    };
    const rools = new Rools({ logging: { error: false, debug: true, delegate: spy } });
    await rools.register([ruleMoodGreat, ruleMoodSad, ruleGoWalking, ruleStayAtHome]);
    await rools.evaluate({ user: frank, weather: good });
    expect(counter).to.not.be.equals(0);
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
      await rools.evaluate({ user: frank, weather: good });
    } catch (error) {
      // ignore
    }
    expect(counter).to.not.be.equals(0);
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
      await rools.evaluate({ user: frank, weather: good });
    } catch (error) {
      // ignore
    }
    expect(counter).to.not.be.equals(0);
  });
});

describe('Rools.evaluate() / console logging', () => {
  beforeEach(() => {
    sinon.spy(console, 'log');
    sinon.spy(console, 'error');
  });

  afterEach(() => {
    console.log.restore(); // eslint-disable-line no-console
    console.error.restore(); // eslint-disable-line no-console
  });

  it('should log debug', async () => {
    const rools = new Rools({ logging: { error: false, debug: true } });
    await rools.register([ruleMoodGreat, ruleMoodSad, ruleGoWalking, ruleStayAtHome]);
    await rools.evaluate({ user: frank, weather: good });
    expect(console.log).to.be.called; // eslint-disable-line no-unused-expressions, no-console
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
      await rools.evaluate({ user: frank, weather: good });
    } catch (error) {
      // ignore
    }
    expect(console.error).to.be.called; // eslint-disable-line no-unused-expressions, no-console
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
      await rools.evaluate({ user: frank, weather: good });
    } catch (error) {
      // ignore
    }
    expect(console.error).to.be.called; // eslint-disable-line no-unused-expressions, no-console
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
      await rools.evaluate({ user: frank, weather: good });
    } catch (error) {
      // ignore
    }
    expect(console.error).to.be.called; // eslint-disable-line no-unused-expressions, no-console
  });
});
