const Rools = require('../src');
require('./setup');

describe('Rule evaluation / simple', () => {
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
    name: 'mood is great if 200 stars or more',
    when: facts => facts.user.stars >= 200,
    then: (facts) => {
      facts.user.mood = 'great';
    },
  };

  const ruleMoodSad = {
    name: 'mood is sad if less than 200 stars',
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

  it('Test 1', () => {
    const result = rools.evaluate({ user: frank, weather: weatherGood });
    console.log(result); // eslint-disable-line no-console
    expect(result.user.mood).to.be.equal('great');
    expect(result.goWalking).to.be.equal(true);
  });

  it('Test 2', () => {
    const result = rools.evaluate({ user: michael, weather: weatherGood });
    console.log(result); // eslint-disable-line no-console
    expect(result.user.mood).to.be.equal('sad');
    expect(result.stayAtHome).to.be.equal(true);
  });

  it('Test 3', () => {
    const result = rools.evaluate({ user: frank, weather: weatherBad });
    console.log(result); // eslint-disable-line no-console
    expect(result.user.mood).to.be.equal('great');
    expect(result.stayAtHome).to.be.equal(true);
  });
});
