const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const Rools = require('../src');

chai.use(chaiAsPromised);
chai.use(sinonChai);

global.chai = chai;
global.sinon = sinon;
global.expect = chai.expect;
global.should = chai.should();

describe('Two iterations', () => {
  const frank = {
    name: 'frank',
    stars: 347,
  };

  const michael = {
    name: 'michael',
    stars: 156,
  };

  const weatherGood = {
    temperature: 20,
    windy: true,
    rainy: false,
  };

  const weatherBad = {
    temperature: 9,
    windy: true,
    rainy: true,
  };

  const ruleMoodGreat = {
    name: 'mood is great if stars is greater than 200',
    when: facts => facts.user.stars >= 200,
    then: (facts) => {
      facts.user.mood = 'great';
    },
  };

  const ruleMoodSad = {
    name: 'mood is sad if stars is lower or equals 200',
    when: facts => facts.user.stars < 200,
    then: (facts) => {
      facts.user.mood = 'sad';
    },
  };

  const ruleGoWalking = {
    name: 'go for a walk if mood is great and the weather is fine',
    when: [
      facts => facts.user.mood === 'great',
      facts => facts.weather.temperature >= 20,
      facts => !facts.weather.rainy,
    ],
    then: (facts) => {
      facts.goWalking = true;
    },
  };

  const ruleStayAtHome = {
    name: 'stay at home if mood is sad or the weather is bad',
    when: [
      facts => facts.weather.rainy || facts.user.mood === 'sad',
    ],
    then: (facts) => {
      facts.stayAtHome = true;
    },
  };

  let rools;

  before(() => {
    rools = new Rools({ debug: true });
    rools.register(ruleMoodGreat, ruleMoodSad, ruleGoWalking, ruleStayAtHome);
  });

  after(() => {
  });

  it('test 1', () => {
    const result = rools.execute({ user: frank, weather: weatherGood });
    console.log(result); // eslint-disable-line no-console
    expect(result.user.mood).to.be.equal('great');
    expect(result.goWalking).to.be.equal(true);
  });

  it('test 2', () => {
    const result = rools.execute({ user: michael, weather: weatherGood });
    console.log(result); // eslint-disable-line no-console
    expect(result.user.mood).to.be.equal('sad');
    expect(result.stayAtHome).to.be.equal(true);
  });

  it('test 3', () => {
    const result = rools.execute({ user: frank, weather: weatherBad });
    console.log(result); // eslint-disable-line no-console
    expect(result.user.mood).to.be.equal('great');
    expect(result.stayAtHome).to.be.equal(true);
  });
});
