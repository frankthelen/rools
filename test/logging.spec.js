const Rools = require('../src');
const { frank } = require('./facts/users')();
const { good } = require('./facts/weather')();
const {
  ruleMoodGreat, ruleMoodSad, ruleGoWalking, ruleStayAtHome,
} = require('./rules/mood');
require('./setup');

describe('Rules.evaluate() / delegate logging', () => {
  it('should log debug', () => {
    let counter = 0;
    const spy = () => {
      counter += 1;
    };
    const rools = new Rools({ logging: { error: false, debug: true, delegate: spy } });
    rools.register(ruleMoodGreat, ruleMoodSad, ruleGoWalking, ruleStayAtHome);
    rools.evaluate({ user: frank, weather: good });
    expect(counter).to.not.be.equals(0);
  });

  it('should log errors', () => {
    const brokenRule = {
      name: 'broken rule #2',
      when: () => true, // fire immediately
      then: (facts) => {
        facts.bla.blub = 'blub'; // TypeError: Cannot read property 'blub' of undefined
      },
    };
    let counter = 0;
    const spy = () => {
      counter += 1;
    };
    const rools = new Rools({ logging: { error: true, debug: false, delegate: spy } });
    rools.register(brokenRule, ruleMoodGreat, ruleMoodSad, ruleGoWalking, ruleStayAtHome);
    rools.evaluate({ user: frank, weather: good });
    expect(counter).to.not.be.equals(0);
  });

  it('should log errors by default', () => {
    const brokenRule = {
      name: 'broken rule #2',
      when: () => true, // fire immediately
      then: (facts) => {
        facts.bla.blub = 'blub'; // TypeError: Cannot read property 'blub' of undefined
      },
    };
    let counter = 0;
    const spy = () => {
      counter += 1;
    };
    const rools = new Rools({ logging: { delegate: spy } });
    rools.register(brokenRule, ruleMoodGreat, ruleMoodSad, ruleGoWalking, ruleStayAtHome);
    rools.evaluate({ user: frank, weather: good });
    expect(counter).to.not.be.equals(0);
  });
});

describe('Rules.evaluate() / console logging', () => {
  beforeEach(() => {
    sinon.spy(console, 'log');
    sinon.spy(console, 'error');
  });

  afterEach(() => {
    console.log.restore(); // eslint-disable-line no-console
    console.error.restore(); // eslint-disable-line no-console
  });

  it('should log debug', () => {
    const rools = new Rools({ logging: { error: false, debug: true } });
    rools.register(ruleMoodGreat, ruleMoodSad, ruleGoWalking, ruleStayAtHome);
    rools.evaluate({ user: frank, weather: good });
    expect(console.log).to.be.called; // eslint-disable-line no-unused-expressions, no-console
  });

  it('should log errors', () => {
    const brokenRule = {
      name: 'broken rule #2',
      when: () => true, // fire immediately
      then: (facts) => {
        facts.bla.blub = 'blub'; // TypeError: Cannot read property 'blub' of undefined
      },
    };
    const rools = new Rools({ logging: { error: true, debug: false } });
    rools.register(brokenRule, ruleMoodGreat, ruleMoodSad, ruleGoWalking, ruleStayAtHome);
    rools.evaluate({ user: frank, weather: good });
    expect(console.error).to.be.called; // eslint-disable-line no-unused-expressions, no-console
  });

  it('should log errors by default', () => {
    const brokenRule = {
      name: 'broken rule #2',
      when: () => true, // fire immediately
      then: (facts) => {
        facts.bla.blub = 'blub'; // TypeError: Cannot read property 'blub' of undefined
      },
    };
    const rools = new Rools();
    rools.register(brokenRule, ruleMoodGreat, ruleMoodSad, ruleGoWalking, ruleStayAtHome);
    rools.evaluate({ user: frank, weather: good });
    expect(console.error).to.be.called; // eslint-disable-line no-unused-expressions, no-console
  });

  it('should log errors by default / 2', () => {
    const brokenRule = {
      name: 'broken rule #2',
      when: () => true, // fire immediately
      then: (facts) => {
        facts.bla.blub = 'blub'; // TypeError: Cannot read property 'blub' of undefined
      },
    };
    const rools = new Rools({});
    rools.register(brokenRule, ruleMoodGreat, ruleMoodSad, ruleGoWalking, ruleStayAtHome);
    rools.evaluate({ user: frank, weather: good });
    expect(console.error).to.be.called; // eslint-disable-line no-unused-expressions, no-console
  });
});
